from pydantic import BaseModel, Field
from typing import List, Optional

class ReferenceImage(BaseModel):
    id: str
    url: str
    caption: str

class AlternativeMatch(BaseModel):
    id: str
    brand: str
    model: str
    confidence: int
    imageUrl: str

class ShoppingSource(BaseModel):
    sourceName: str
    brand: str
    bagName: str
    imageUrl: str
    price: Optional[str] = None
    rating: Optional[float] = None
    url: str

class BagIdentificationResult(BaseModel):
    id: str
    brand: str
    model: str
    category: str
    priceLow: int
    priceHigh: int
    currency: str
    confidence: int
    referenceImages: List[ReferenceImage]
    alternativeMatches: List[AlternativeMatch]
    sources: List[ShoppingSource] = Field(default_factory=list)
    uploadedImage: Optional[str] = None
    createdAt: str

class FeedbackPayload(BaseModel):
    scanId: str
    type: str
    correctBrand: Optional[str] = None
    correctModel: Optional[str] = None
    note: Optional[str] = None
