puts "Seeding database..."

demo = User.find_or_create_by!(email: "demo@example.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
end

urls = [
  { original_url: "https://github.com", title: "GitHub" },
  { original_url: "https://stackoverflow.com/questions", title: "Stack Overflow" },
  { original_url: "https://news.ycombinator.com", title: "Hacker News" },
  { original_url: "https://ruby-doc.org", title: "Ruby Docs" },
  { original_url: "https://reactjs.org/docs/getting-started.html", title: "React Docs" },
  { original_url: "https://tailwindcss.com/docs", title: "Tailwind Docs", active: false },
  { original_url: "https://www.postgresql.org/docs/", title: "PostgreSQL Docs" },
  { original_url: "https://guides.rubyonrails.org", title: "Rails Guides" },
]

referrers = ["https://google.com", "https://twitter.com", "https://reddit.com", "https://facebook.com", "Direct", "https://linkedin.com"]
countries = ["United States", "United Kingdom", "Germany", "Canada", "India", "Australia", "France", "Japan"]
cities = ["New York", "London", "Berlin", "Toronto", "Mumbai", "Sydney", "Paris", "Tokyo"]
browsers = ["Chrome", "Firefox", "Safari", "Edge"]
oses = ["Windows", "macOS", "Linux", "iOS", "Android"]

urls.each_with_index do |url_data, i|
  link = demo.short_links.find_or_create_by!(original_url: url_data[:original_url]) do |l|
    l.title = url_data[:title]
    l.is_active = url_data[:active] != false
    l.expires_at = i == 3 ? 7.days.from_now : (i == 6 ? 2.days.from_now : nil)
  end

  next if link.clicks.any?

  click_count = rand(20..150)
  ips_used = []

  click_count.times do
    ip = Faker::Internet.public_ip_v4_address
    is_new_ip = !ips_used.include?(ip)
    ips_used << ip if is_new_ip

    link.clicks.create!(
      ip_address: ip,
      referrer: referrers.sample,
      country: countries.sample,
      city: cities.sample,
      browser: browsers.sample,
      os: oses.sample,
      is_unique: is_new_ip,
      clicked_at: rand(30).days.ago + rand(24).hours
    )
  end

  puts "  Created #{link.title} (#{link.short_code}) with #{click_count} clicks"
end

puts "Done! Demo account: demo@example.com / password123"
