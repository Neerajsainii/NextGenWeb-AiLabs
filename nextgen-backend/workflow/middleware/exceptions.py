from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    detail = response.data.get("detail")
    if detail:
        response.data = {
            "success": False,
            "error": str(detail),
            "status_code": response.status_code,
        }
    else:
        response.data = {
            "success": False,
            "errors": response.data,
            "status_code": response.status_code,
        }

    print("API ERROR:", response.data)
    return response
