from pydantic import BaseModel, Field
from typing import List, Optional

class AlternativeMatch(BaseModel):
    id: str
    brand: str
    model: str
    confidence: int

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
    variant: Optional[str] = None
    category: str
    dimensions: Optional[str] = None
    priceLow: int
    priceHigh: int
    currency: str
    confidence: int
    alternativeMatches: List[AlternativeMatch] = Field(default_factory=list)
    sources: List[ShoppingSource] = Field(default_factory=list)
    uploadedImage: Optional[str] = None
    createdAt: str
    # False right after the core /identify call — alternativeMatches/sources are
    # filled in afterwards by a separate, faster follow-up call.
    extrasReady: bool = False

class ExtrasRequest(BaseModel):
    brand: str
    model: str
    variant: Optional[str] = None
    category: str

class IdentificationExtras(BaseModel):
    alternativeMatches: List[AlternativeMatch] = Field(default_factory=list)
    sources: List[ShoppingSource] = Field(default_factory=list)

class FeedbackPayload(BaseModel):
    scanId: str
    type: str
    correctBrand: Optional[str] = None
    correctModel: Optional[str] = None
    note: Optional[str] = None
