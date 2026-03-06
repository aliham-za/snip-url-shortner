class JwtService
  SECRET = ENV.fetch("JWT_SECRET") { Rails.application.credentials.secret_key_base }

  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    return nil if token.blank?

    body = JWT.decode(token, SECRET, true, algorithm: "HS256")[0]
    decoded = HashWithIndifferentAccess.new(body)
    return nil unless decoded[:user_id].present?

    decoded
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError
    nil
  end
end
