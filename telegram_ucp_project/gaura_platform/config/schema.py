from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ActorRole(str, Enum):
    USER = "user"
    VENDOR = "vendor"

class PlatformItem(BaseModel):
    """Lighweight metadata for the Central Hub's search index"""
    id: str
    vendor_id: str
    node_id: str
    name: str
    category: str
    base_price: float
    thumbnail_url: Optional[str] = None
    ai_generated_image_url: Optional[str] = None

class HubRelayRequest(BaseModel):
    """A request routed from Hub -> Mobile Node"""
    target_node_id: str
    action: str
    payload: Dict[str, Any]

class MobileResponse(BaseModel):
    """A response from Mobile Node -> Hub"""
    status: str
    data: Dict[str, Any]
    error: Optional[str] = None

class BotInstanceConfig(BaseModel):
    """Configuration for a personalized bot instance"""
    user_id: str
    bot_token: str
    bot_name: str = "Gaura AI"
    is_active: bool = True

class UserAuthRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    role: ActorRole = ActorRole.USER
    bot_token: Optional[str] = None
    upi_id: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    role: str
    node_id: Optional[str] = None
    bot_token: Optional[str] = None
    upi_id: Optional[str] = None

class PaymentStatus(str, Enum):
    AWAITING_PAYMENT = "awaiting_payment"
    PAID = "paid"
    FAILED = "failed"
    ESCROW_HOLD = "escrow_hold"

class OrderLineItem(BaseModel):
    id: str
    product_id: str
    name: str
    quantity: int
    price: float

class Order(BaseModel):
    id: str
    buyer_id: str
    vendor_id: str
    status: str = "pending"
    payment_status: PaymentStatus = PaymentStatus.AWAITING_PAYMENT
    items: List[OrderLineItem]
    total_amount: float
    created_at: str
