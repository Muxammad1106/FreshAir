from django.db import models
from django.db.models import CASCADE

from core.querysets.company import CompanyQuerySet
from toolkit.models import BaseModel

# Base model for company level models
class BaseCompanyModel(BaseModel):
    company = models.ForeignKey('core.Company', CASCADE)

    class Meta:
        abstract = True


class Company(BaseModel):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)

    objects = CompanyQuerySet.as_manager()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'core_companies'
