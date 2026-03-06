# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_06_195928) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "api_keys", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "api_key", null: false
    t.string "key_prefix", null: false
    t.string "name"
    t.datetime "expires_at"
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["api_key"], name: "index_api_keys_on_api_key", unique: true
    t.index ["key_prefix"], name: "index_api_keys_on_key_prefix"
    t.index ["user_id"], name: "index_api_keys_on_user_id"
  end

  create_table "clicks", force: :cascade do |t|
    t.bigint "short_link_id", null: false
    t.string "ip_address", null: false
    t.string "country"
    t.string "city"
    t.string "referrer"
    t.string "browser"
    t.string "os"
    t.boolean "is_unique", default: false, null: false
    t.datetime "clicked_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.index ["clicked_at"], name: "index_clicks_on_clicked_at"
    t.index ["short_link_id", "ip_address"], name: "index_clicks_on_short_link_id_and_ip_address"
    t.index ["short_link_id"], name: "index_clicks_on_short_link_id"
  end

  create_table "short_links", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "original_url", null: false
    t.string "short_code", null: false
    t.string "custom_slug"
    t.string "title"
    t.boolean "is_active", default: true, null: false
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "subdomain_id"
    t.index ["custom_slug"], name: "index_short_links_on_custom_slug", unique: true
    t.index ["short_code"], name: "index_short_links_on_short_code", unique: true
    t.index ["subdomain_id", "short_code"], name: "index_short_links_on_subdomain_and_code", unique: true
    t.index ["subdomain_id"], name: "index_short_links_on_subdomain_id"
    t.index ["user_id"], name: "index_short_links_on_user_id"
    t.check_constraint "char_length(original_url::text) <= 2048", name: "chk_original_url_length"
    t.check_constraint "char_length(short_code::text) >= 4 AND char_length(short_code::text) <= 20", name: "chk_short_code_length"
  end

  create_table "subdomains", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_subdomains_on_name", unique: true
    t.index ["user_id"], name: "index_subdomains_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "api_keys", "users"
  add_foreign_key "clicks", "short_links"
  add_foreign_key "short_links", "subdomains"
  add_foreign_key "short_links", "users"
  add_foreign_key "subdomains", "users"
end
