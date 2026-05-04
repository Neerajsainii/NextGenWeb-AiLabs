from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from workflow.models import EmployeeProfile, EmployeeRole, EmployeeStatus

User = get_user_model()


class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = ["role", "is_active_employee", "account_status"]


class EmployeeUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="_id", read_only=True)
    role = serializers.CharField(source="employee_profile.role")
    account_status = serializers.CharField(source="employee_profile.account_status")
    is_suspend = serializers.BooleanField(source="employee_profile.is_suspend")

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "account_status", "is_suspend"]
    def get_id(self, obj):
        return str(obj.id)

class EmployeeCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=EmployeeRole.choices, write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    account_status = serializers.ChoiceField(
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.ACTIVE,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
            "account_status",
        ]
        read_only_fields = ["id"]

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate_role(self, value: str) -> str:
        request = self.context.get("request")
        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError("Authenticated creator is required.")

        profile = getattr(request.user, "employee_profile", None)
        if profile is None:
            raise serializers.ValidationError("Only employee accounts can create employees.")

        allowed_by_role = {
            EmployeeRole.ADMIN: {EmployeeRole.HR, EmployeeRole.SALES, EmployeeRole.PROJECT_MANAGER, EmployeeRole.DEVELOPER},
            EmployeeRole.HR: {EmployeeRole.SALES, EmployeeRole.PROJECT_MANAGER, EmployeeRole.DEVELOPER},
        }
        allowed = allowed_by_role.get(profile.role, set())

        if value not in allowed:
            raise serializers.ValidationError("You cannot create this role.")

        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")
        account_status = validated_data.pop("account_status", EmployeeStatus.ACTIVE)

        user = User.objects.create_user(password=password, **validated_data)
        EmployeeProfile.objects.create(
            user=user,
            role=role,
            account_status=account_status,
            is_active_employee=True,
        )
        user.is_active = account_status != EmployeeStatus.BLOCK
        user.save(update_fields=["is_active"])
        return user


class EmployeeStatusUpdateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=EmployeeRole.choices, source="employee_profile.role", required=False)
    account_status = serializers.ChoiceField(
        choices=EmployeeStatus.choices,
        source="employee_profile.account_status",
        required=False,
    )

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role", "account_status"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        request = self.context.get("request")
        target_user = self.instance
        requester_profile = getattr(request.user, "employee_profile", None) if request else None
        target_profile = getattr(target_user, "employee_profile", None)

        if requester_profile is None or target_profile is None:
            raise serializers.ValidationError("Invalid employee update request.")

        next_role = attrs.get("employee_profile", {}).get("role", target_profile.role)

        if requester_profile.role == EmployeeRole.ADMIN:
            if next_role == EmployeeRole.ADMIN:
                raise serializers.ValidationError("Top Admin role cannot be assigned from this screen.")
            if target_profile.role == EmployeeRole.ADMIN:
                raise serializers.ValidationError("Top Admin account cannot be edited from this screen.")
        elif requester_profile.role == EmployeeRole.HR:
            if target_profile.role not in {EmployeeRole.SALES, EmployeeRole.PROJECT_MANAGER, EmployeeRole.DEVELOPER}:
                raise serializers.ValidationError("HR can manage only Sales, Project Manager, and Developer accounts.")
            if next_role not in {EmployeeRole.SALES, EmployeeRole.PROJECT_MANAGER, EmployeeRole.DEVELOPER}:
                raise serializers.ValidationError("HR cannot assign this role.")
        else:
            raise serializers.ValidationError("You are not authorized to manage employees.")

        return attrs

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("employee_profile", {})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile = instance.employee_profile
        if "role" in profile_data:
            profile.role = profile_data["role"]
        if "account_status" in profile_data:
            new_status = profile_data["account_status"]
            profile.account_status = new_status
            if new_status == EmployeeStatus.BLOCK:
                profile.is_active_employee = False
                profile.is_suspend = False
                instance.is_active = False
            elif new_status == EmployeeStatus.SUSPEND:
                profile.is_active_employee = True
                profile.is_suspend = True
                instance.is_active = True
            else:  # ACTIVE
                profile.is_active_employee = True
                profile.is_suspend = False
                instance.is_active = True
            instance.save(update_fields=["is_active"])
        profile.save(update_fields=["role", "account_status", "is_active_employee", "is_suspend", "updated_at"])

        return instance


class ProfileUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "old_password", "new_password", "confirm_password"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exclude(pk=self.context["request"].user.pk).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exclude(pk=self.context["request"].user.pk).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate(self, attrs):
        new_password = attrs.get("new_password", "").strip()
        old_password = attrs.get("old_password", "").strip()
        confirm_password = attrs.get("confirm_password", "").strip()
        if new_password:
            if not old_password:
                raise serializers.ValidationError({"old_password": "Current password is required."})
            if not self.context["request"].user.check_password(old_password):
                raise serializers.ValidationError({"old_password": "Current password is incorrect."})
            if new_password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
            validate_password(new_password, user=self.context["request"].user)
        return attrs

    def update(self, instance, validated_data):
        validated_data.pop("old_password", None)
        new_password = validated_data.pop("new_password", None)
        validated_data.pop("confirm_password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_password:
            instance.set_password(new_password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(label="Username or Email")
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=EmployeeRole.choices)

    def validate(self, attrs):
        request = self.context.get("request")
        identifier = attrs.get("identifier", "").strip()

        # Resolve user by username or email
        lookup_user = (
            User.objects.filter(username=identifier).first()
            or User.objects.filter(email__iexact=identifier).first()
        )

        if lookup_user is not None:
            lookup_profile = getattr(lookup_user, "employee_profile", None)
            if lookup_profile is not None and lookup_profile.account_status == EmployeeStatus.SUSPEND:
                # Ensure is_active and is_active_employee are correct for suspended users
                changed = False
                if not lookup_user.is_active:
                    lookup_user.is_active = True
                    changed = True
                if changed:
                    lookup_user.save(update_fields=["is_active"])
                if not lookup_profile.is_active_employee or not lookup_profile.is_suspend:
                    lookup_profile.is_active_employee = True
                    lookup_profile.is_suspend = True
                    lookup_profile.save(update_fields=["is_active_employee", "is_suspend", "updated_at"])

        # Django's authenticate() uses username; resolve actual username first
        auth_username = lookup_user.username if lookup_user else identifier
        user = lookup_user

        if user is None:
            raise serializers.ValidationError("Invalid username/email or password.")

        if not user.check_password(attrs.get("password")):
            raise serializers.ValidationError("Invalid username/email or password.")

        if user is None:
            if lookup_user is not None:
                lookup_profile = getattr(lookup_user, "employee_profile", None)
                if lookup_profile is not None and lookup_profile.account_status == EmployeeStatus.BLOCK:
                    raise serializers.ValidationError("Your account has been blocked. Contact HR.")
            raise serializers.ValidationError("Invalid username/email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is inactive.")

        profile = getattr(user, "employee_profile", None)
        if profile is None:
            raise serializers.ValidationError("Employee account not found.")

        if profile.account_status == EmployeeStatus.BLOCK:
            raise serializers.ValidationError("Your account has been blocked. Contact HR.")
        if profile.account_status not in {EmployeeStatus.ACTIVE, EmployeeStatus.SUSPEND}:
            raise serializers.ValidationError("Employee account not active.")

        if profile.role != attrs.get("role"):
            raise serializers.ValidationError("Selected role does not match your account role.")

        attrs["user"] = user
        return attrs
