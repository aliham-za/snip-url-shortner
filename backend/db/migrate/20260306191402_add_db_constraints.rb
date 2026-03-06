class AddDbConstraints < ActiveRecord::Migration[7.2]
  def change
    # Add NOT NULL constraints where missing
    change_column_null :clicks, :ip_address, false
    change_column_null :clicks, :clicked_at, false

    # Add check constraint: original_url max length
    add_check_constraint :short_links, "char_length(original_url) <= 2048", name: "chk_original_url_length"

    # Add check constraint: short_code length
    add_check_constraint :short_links, "char_length(short_code) >= 4 AND char_length(short_code) <= 20", name: "chk_short_code_length"
  end
end
