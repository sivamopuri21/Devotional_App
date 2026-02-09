import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../repositories/auth_repository.dart';

class LoginParams {
  final String identifier;
  final String password;

  LoginParams({required this.identifier, required this.password});
}

class AuthResult {
  final String userId;
  final String accessToken;
  final String refreshToken;

  AuthResult({required this.userId, required this.accessToken, required this.refreshToken});
}

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  Future<Either<Failure, AuthResult>> call(LoginParams params) async {
    return await repository.login(params.identifier, params.password);
  }
}
