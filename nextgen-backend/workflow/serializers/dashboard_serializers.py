from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):
    role = serializers.CharField()
    metrics = serializers.DictField()
