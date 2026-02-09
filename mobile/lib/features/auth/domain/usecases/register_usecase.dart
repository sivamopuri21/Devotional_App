import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

class RegisterParams {
  final String fullName;
  final String? email;
  final String? phone;
  final String password;
  final bool isProvider;

  RegisterParams({
    required this.fullName,
    this.email,
    this.phone,
    required this.password,
    this.isProvider = false,
  });
}

class RegisterResult {
  final String userId;
  final bool verificationRequired;
  final String verificationChannel;

  RegisterResult({
    required this.userId,
    required this.verificationRequired,
    required this.verificationChannel,
  });
}

class RegisterUseCase {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  Future<Either<Failure, RegisterResult>> call(RegisterParams params) async {
    return await repository.register(
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      password: params.password,
      isProvider: params.isProvider,
    );
  }
}
