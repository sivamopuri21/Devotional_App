import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class AuthLocalDataSource {
  Future<void> saveTokens(String accessToken, String refreshToken);
  Future<String?> getAccessToken();
  Future<String?> getRefreshToken();
  Future<void> clearTokens();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final FlutterSecureStorage storage;
  
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  AuthLocalDataSourceImpl(this.storage);

  @override
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await storage.write(key: _accessTokenKey, value: accessToken);
    await storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  @override
  Future<String?> getAccessToken() async {
    return await storage.read(key: _accessTokenKey);
  }

  @override
  Future<String?> getRefreshToken() async {
    return await storage.read(key: _refreshTokenKey);
  }

  @override
  Future<void> clearTokens() async {
    await storage.delete(key: _accessTokenKey);
    await storage.delete(key: _refreshTokenKey);
  }
}
