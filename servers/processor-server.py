from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import logging

# Production Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Snapshot-Processor")

app = FastAPI(title="MarketSnapshot-Processor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post("/v1/analyze")
async def analyze_market_segment(payload: dict):
    """
    Standardized endpoint for market data refinement and statistical analysis.
    """
    logger.info("Processing inbound market segment.")
    
    try:
        # Extract active and sold listings from payload
        active_items = payload.get('active', [])
        sold_items = payload.get('sold', [])
        
        active_count = len(active_items)
        sold_count = len(sold_items)
        
        logger.info(f"Active count: {active_count}, Sold count: {sold_count}")
        
        # Calculate Sell-Through Rate (STR)
        total_inventory = sold_count + active_count
        if total_inventory > 0:
            sell_through_rate = round((sold_count / total_inventory) * 100, 1)
        else:
            sell_through_rate = 0.0
        
        # Use active items for price analysis (fallback to sold if no active)
        price_items = active_items if active_items else sold_items
        
        if not price_items:
            return {
                "error": "EMPTY_DATASET",
                "status": 400,
                "message": "No active or sold listings provided"
            }
        
        # Vectorized price extraction
        raw_values = np.array([float(i['price']['value']) for i in price_items if 'price' in i])
        
        if raw_values.size == 0:
            return {"error": "NON_NUMERIC_DATA", "status": 422}
        
        # Outlier Suppression via Interquartile Range (IQR)
        q1, q3 = np.percentile(raw_values, [25, 75])
        iqr = q3 - q1
        
        lower_bound = q1 - (1.5 * iqr)
        upper_bound = q3 + (1.5 * iqr)
        
        refined_set = raw_values[(raw_values >= lower_bound) & (raw_values <= upper_bound)]
        
        if refined_set.size == 0:
            refined_set = raw_values
        
        # Compute Core Statistics
        median = float(np.median(refined_set))
        std_dev = float(np.std(refined_set))
        
        # Calculate Market Variance
        variance_index = round(std_dev / median, 4) if median > 0 else 0
        
        # Calculate confidence
        raw_count = len(raw_values)
        refined_count = len(refined_set)
        confidence = calculate_confidence(raw_count, refined_count, variance_index)
        
        # Determine activity level
        if variance_index > 1.0:
            activity_level = "High"
        elif variance_index > 0.4:
            activity_level = "Moderate"
        else:
            activity_level = "Low"
        
        # Determine competition level
        if active_count > 30:
            competition_level = "High"
        elif active_count > 10:
            competition_level = "Moderate"
        else:
            competition_level = "Low"
        
        # Determine market condition string (non‑advisory)
        market_condition = get_market_condition(
            sell_through_rate, variance_index, confidence
        )
        
        # Market velocity
        if sell_through_rate >= 40:
            market_velocity = "HIGH"
        elif sell_through_rate >= 20:
            market_velocity = "MODERATE"
        elif sell_through_rate >= 10:
            market_velocity = "LOW"
        else:
            market_velocity = "STAGNANT"
        
        return {
            "summary": {
                "raw_count": raw_count,
                "refined_count": refined_count,
                "variance_index": variance_index,
                "confidence": confidence,
                "activity_level": activity_level,
                "competition_level": competition_level,
                "active_listings": active_count,
                "sold_listings": sold_count,
                "sell_through_rate": sell_through_rate,
                "market_velocity": market_velocity
            },
            "results": {
                "floor": round(float(np.min(refined_set)), 2),
                "ceiling": round(float(np.max(refined_set)), 2),
                "median": round(median, 2),
                "p25": round(float(np.percentile(refined_set, 25)), 2),
                "p75": round(float(np.percentile(refined_set, 75)), 2),
                "standard_deviation": round(std_dev, 2),
                "market_condition": market_condition
            }
        }
        
    except Exception as e:
        logger.error(f"Processing Failure: {str(e)}")
        return {"error": "PROCESSING_ERROR", "detail": str(e)}

def calculate_confidence(raw_count: int, refined_count: int, variance_index: float) -> int:
    """Calculate confidence score (20-95%)"""
    
    if raw_count == 0:
        return 20
    
    sample_factor = min(1.0, raw_count / 30)
    quality_factor = refined_count / raw_count if raw_count > 0 else 0
    
    if variance_index <= 0.2:
        stability_factor = 1.0
    elif variance_index <= 0.5:
        stability_factor = 0.85
    elif variance_index <= 1.0:
        stability_factor = 0.7
    elif variance_index <= 2.0:
        stability_factor = 0.5
    else:
        stability_factor = 0.35
    
    raw_confidence = sample_factor * quality_factor * stability_factor * 0.95
    confidence = max(20, min(95, int(raw_confidence * 100)))
    
    return confidence

def determine_activity_level(variance_index: float) -> str:
    """Determine market activity level from variance"""
    if variance_index > 1.0:
        return "High"
    elif variance_index > 0.4:
        return "Moderate"
    else:
        return "Low"


def determine_competition_level(raw_count: int) -> str:
    """Determine competition level from listing count"""
    if raw_count > 30:
        return "High"
    elif raw_count > 10:
        return "Moderate"
    else:
        return "Low"

def get_market_condition(sell_through_rate: float, variance_index: float, confidence: int) -> str:
    if confidence < 50:
        return "Insufficient Data"
    elif sell_through_rate >= 40:
        return "Strong Demand · High Turnover"
    elif sell_through_rate >= 20:
        return "Active Market · Normal Liquidity"
    elif sell_through_rate >= 10:
        return "Slow Market · Price Sensitivity"
    else:
        return "Stagnant · Low Turnover"
    
if __name__ == "__main__":
    import uvicorn
    # Remove workers=4 for Windows development
    uvicorn.run("processor-server:app", host="0.0.0.0", port=8000, reload=True)