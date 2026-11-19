# Generate the stylesheet from the design's YAML front matter.
require 'yaml'

root = File.expand_path('..', __dir__)
source = File.read(File.join(root, 'DESIGN.md')).split(/^---$/, 3).fetch(1)
design = YAML.safe_load(source)
variables = {}

%w[colors identity rounded spacing layout].each do |group|
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
palette = design.fetch('identity').values.map { |hex| "  '#{hex}'," }.join("\n")
outputs = {
  'public/ui/tokens.css' => css,
  'src/ui/identity-palette.ts' => "// Generated from DESIGN.md by scripts/design-tokens.rb.\nexport const identityPalette = [\n#{palette}\n] as const\n",
}
outputs.each do |relative, content|
  path = File.join(root, relative)
  if ARGV == ['--check']
    abort "Run ruby scripts/design-tokens.rb to refresh #{relative}" unless File.read(path) == content
  else
    File.write(path, content)
  end
end
