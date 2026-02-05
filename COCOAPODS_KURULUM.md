# CocoaPods Kurulum Rehberi

CocoaPods iOS projeleri için bağımlılık yöneticisidir. Kurulum için birkaç yöntem var.

## Yöntem 1: Gem ile Kurulum (Önerilen)

### Adımlar:

```bash
# 1. Ruby'nin kurulu olduğundan emin olun
ruby --version

# 2. CocoaPods'u kurun
sudo gem install cocoapods

# 3. Kurulumu kontrol edin
pod --version
```

**Not:** Eğer `sudo` izni yoksa, aşağıdaki alternatif yöntemleri deneyin.

## Yöntem 2: User Install (Sudo Olmadan)

```bash
# CocoaPods'u kullanıcı dizinine kur
gem install cocoapods --user-install

# PATH'e ekle (eğer gerekirse)
export PATH="$HOME/.gem/ruby/$(ruby -e 'puts RUBY_VERSION[/\d+\.\d+/]')/bin:$PATH"

# Kontrol et
pod --version
```

## Yöntem 3: Homebrew ile (Eğer Homebrew Varsa)

```bash
# Homebrew ile kur
brew install cocoapods

# Kontrol et
pod --version
```

## Yöntem 4: Bundler ile (Proje Bazlı)

```bash
# Gemfile oluştur (eğer yoksa)
echo "source 'https://rubygems.org'" > Gemfile
echo "gem 'cocoapods', '~> 1.15'" >> Gemfile

# Bundle install
bundle install

# Bundler ile çalıştır
bundle exec pod install
```

## Kurulum Sonrası

CocoaPods kurulduktan sonra:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
pod install
```

## Sorun Giderme

### "Operation not permitted" Hatası
- Terminal'i "Full Disk Access" izniyle çalıştırın
- System Preferences > Security & Privacy > Privacy > Full Disk Access

### "Gem not found" Hatası
```bash
# Gem path'ini kontrol et
gem env

# PATH'e ekle
export PATH="$(gem env gemdir)/bin:$PATH"
```

### Ruby Versiyon Sorunları
```bash
# Ruby versiyonunu kontrol et
ruby --version

# Eğer eski versiyon varsa, rbenv veya rvm kullanın
```

## Hızlı Kurulum Scripti

```bash
# CocoaPods kurulum scripti
if ! command -v pod &> /dev/null; then
    echo "CocoaPods kuruluyor..."
    
    # Önce user install dene
    gem install cocoapods --user-install 2>/dev/null || \
    sudo gem install cocoapods
    
    # PATH'e ekle
    export PATH="$HOME/.gem/ruby/$(ruby -e 'puts RUBY_VERSION[/\d+\.\d+/]')/bin:$PATH"
    
    echo "✅ CocoaPods kuruldu: $(pod --version)"
else
    echo "✅ CocoaPods zaten kurulu: $(pod --version)"
fi
```
