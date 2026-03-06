#!/usr/bin/env bash
set -o errexit

gem install bundler
bundle install
bundle exec rake db:migrate
