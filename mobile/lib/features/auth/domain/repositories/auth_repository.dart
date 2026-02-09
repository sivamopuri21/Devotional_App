import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../usecases/login_usecase.dart';
import '../usecases/register_usecase.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthResult>> login(String identifier, String password);

  Future<Either<Failure, RegisterResult>> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
    bool isProvider = false,
  });

  Future<Either<Failure, AuthResult>> verifyOtp(String contact, String otp, String purpose);

  Future<Either<Failure, void>> sendOtp(String contact, String purpose);

  Future<Either<Failure, void>> logout({bool allDevices = false});

  Future<Either<Failure, AuthResult>> refreshToken(String refreshToken);
}
