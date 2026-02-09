import '../../../../core/network/api_client.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> login(String identifier, String password);
  Future<Map<String, dynamic>> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
    String role = 'MEMBER',
  });
  Future<Map<String, dynamic>> verifyOtp(String contact, String otp, String purpose);
  Future<void> sendOtp(String contact, String purpose);
  Future<void> logout({String? refreshToken, bool allDevices = false});
  Future<Map<String, dynamic>> refreshToken(String refreshToken);
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient client;

  AuthRemoteDataSourceImpl(this.client);

  @override
  Future<Map<String, dynamic>> login(String identifier, String password) async {
    final response = await client.post('/auth/login', {
      'identifier': identifier,
      'password': password,
    });
    if (response['success'] != true) {
      throw Exception(response['error']?['message'] ?? 'Login failed');
    }
    return response['data'];
  }

  @override
  Future<Map<String, dynamic>> register({
    required String fullName,
    String? email,
    String? phone,
    required String password,
    String role = 'MEMBER',
  }) async {
    final response = await client.post('/auth/register', {
      'fullName': fullName,
      if (email != null) 'email': email,
      if (phone != null) 'phone': phone,
      'password': password,
      'role': role,
    });
    if (response['success'] != true) {
      throw Exception(response['error']?['message'] ?? 'Registration failed');
    }
    return response['data'];
  }

  @override
  Future<Map<String, dynamic>> verifyOtp(String contact, String otp, String purpose) async {
    final response = await client.post('/auth/verify-otp', {
      'contact': contact,
      'otp': otp,
      'purpose': purpose,
    });
    if (response['success'] != true) {
      throw Exception(response['error']?['message'] ?? 'Verification failed');
    }
    return response['data'];
  }

  @override
  Future<void> sendOtp(String contact, String purpose) async {
    final response = await client.post('/auth/send-otp', {
      'contact': contact,
      'purpose': purpose,
    });
    if (response['success'] != true) {
      throw Exception(response['error']?['message'] ?? 'Failed to send OTP');
    }
  }

  @override
  Future<void> logout({String? refreshToken, bool allDevices = false}) async {
    await client.post('/auth/logout', {
      if (refreshToken != null) 'refreshToken': refreshToken,
      'allDevices': allDevices,
    });
  }

  @override
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await client.post('/auth/refresh', {
      'refreshToken': refreshToken,
    });
    if (response['success'] != true) {
      throw Exception(response['error']?['message'] ?? 'Token refresh failed');
    }
    return response['data'];
  }
}
