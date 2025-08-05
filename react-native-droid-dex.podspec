require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-droid-dex"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/your-username/react-native-droid-dex.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # iOS implementation is not provided - this module is Android-only
  # This podspec exists for compatibility but provides no functionality
  
  s.dependency "React-Core"

  # Don't install the _specs_ documentation folder into the app
  s.exclude_files = "ios/**/*.md"

  s.ios.deployment_target = "11.0"
  s.pod_target_xcconfig    = {
    "USE_HEADERMAP" => "YES",
    "DEFINES_MODULE" => "YES",
    "SWIFT_COMPILATION_MODE" => "wholemodule"
  }
end