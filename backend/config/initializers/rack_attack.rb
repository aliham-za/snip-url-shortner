class Rack::Attack
  throttle("login/ip", limit: 10, period: 1.minute) do |req|
    req.ip if req.path == "/api/v1/auth/login" && req.post?
  end

  throttle("signup/ip", limit: 5, period: 1.minute) do |req|
    req.ip if req.path == "/api/v1/auth/signup" && req.post?
  end

  throttle("external_api/api_key", limit: 30, period: 1.minute) do |req|
    if req.path.start_with?("/api/v1/external")
      req.get_header("HTTP_X_API_KEY")
    end
  end

  throttle("redirect/ip", limit: 60, period: 1.minute) do |req|
    if req.path.match?(/\A\/[a-zA-Z0-9\-_]+\z/) && !req.path.start_with?("/api")
      req.ip
    end
  end

  throttle("api/ip", limit: 120, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/api")
  end
end
