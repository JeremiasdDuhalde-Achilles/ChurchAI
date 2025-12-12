class ChurchAIException(Exception):
    pass

class BusinessRuleViolationError(ChurchAIException):
    pass

class ChurchNotFoundError(ChurchAIException):
    pass

class DuplicateChurchError(ChurchAIException):
    pass
