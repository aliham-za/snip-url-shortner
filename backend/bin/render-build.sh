#!/usr/bin/env bash
set -o errexit

gem install bundler
bundle config set frozen false
bundle install
bundle exec rake db:migrate
