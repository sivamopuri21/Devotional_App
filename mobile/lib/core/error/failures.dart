class Failure {
  final String message;
  final String? code;

  Failure({required this.message, this.code});
}

class ServerFailure extends Failure {
  ServerFailure({super.message = 'Server error', super.code});
}

class NetworkFailure extends Failure {
  NetworkFailure({super.message = 'No internet connection', super.code});
}

class CacheFailure extends Failure {
  CacheFailure({super.message = 'Cache error', super.code});
}

class AuthFailure extends Failure {
  AuthFailure({super.message = 'Authentication failed', super.code});
}

class ValidationFailure extends Failure {
  ValidationFailure({super.message = 'Validation failed', super.code});
}
