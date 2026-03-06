class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :validatable

  has_many :short_links, dependent: :destroy
  has_many :clicks, through: :short_links
  has_many :api_keys, dependent: :destroy
  has_many :subdomains, dependent: :destroy
end
