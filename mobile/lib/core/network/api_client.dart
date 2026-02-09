import 'package:dio/dio.dart';

class ApiClient {
  final Dio _dio;
  String? _accessToken;

  ApiClient(this._dio);

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
  };

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data) async {
    final response = await _dio.post(
      path,
      data: data,
      options: Options(headers: _headers),
    );
    return response.data;
  }

  Future<Map<String, dynamic>> get(String path) async {
    final response = await _dio.get(
      path,
      options: Options(headers: _headers),
    );
    return response.data;
  }

  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> data) async {
    final response = await _dio.patch(
      path,
      data: data,
      options: Options(headers: _headers),
    );
    return response.data;
  }

  Future<Map<String, dynamic>> delete(String path) async {
    final response = await _dio.delete(
      path,
      options: Options(headers: _headers),
    );
    return response.data;
  }
}
