# Generate the stylesheet from the design's YAML front matter.
require 'yaml'

root = File.expand_path('..', __dir__)
source = File.read(File.join(root, 'DESIGN.md')).split(/^---$/, 3).fetch(1)
design = YAML.safe_load(source)
variables = {}

%w[colors rounded spacing layout].each do |group|
  design.fetch(group).each { |key, value| variables["#{group}-#{key}"] = value }
end
design.fetch('typography').each do |name, type|
  type.each { |key, value| variables["typography-#{name}-#{key}"] = value }
  variables["typography-#{name}"] = "%{fontWeight} %{fontSize}/%{lineHeight} %{fontFamily}" % type.transform_keys(&:to_sym)
end
design.fetch('components').each do |name, component|
  component.each do |key, value|
    variables["components-#{name}-#{key}"] = value.to_s.gsub(/\{([\w.-]+)\}/) { "var(--#{Regexp.last_match(1).tr('.', '-')})" }
  end
end

css = "/* Generated from DESIGN.md by scripts/design-tokens.rb. */\n:root {\n" +
      variables.map { |key, value| "  --#{key}: #{value};\n" }.join + "}\n"
path = File.join(root, 'public/ui/tokens.css')
if ARGV == ['--check']
  abort 'Run ruby scripts/design-tokens.rb to refresh public/ui/tokens.css' unless File.read(path) == css
else
  File.write(path, css)
end
