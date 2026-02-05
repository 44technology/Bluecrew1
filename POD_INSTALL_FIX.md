# "spawn pod ENOENT" Hatası – Çözüm

CocoaPods Gem ile kuruldu ama `npx expo run:ios` çalıştırdığında `pod install` bulamıyor (PATH farklı).

---

## Yöntem 0: Homebrew ile CocoaPods (önerilen, kalıcı)

Homebrew ile kurarsanız `pod` standart PATH’te olur, Expo da bulur:

```bash
brew install cocoapods
```

Sonra proje klasöründe:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
npx expo run:ios
```

Homebrew yoksa: https://brew.sh → kurulum sonrası yukarıdaki komutları çalıştırın.

---

## Yöntem 1: Aynı terminalde PATH + pod + expo (tek seferde)

**Hepsini aynı terminalde, sırayla** yapıştırın (export’tan sonra terminali kapatmayın):

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project
export PATH="$(gem environment 2>/dev/null | grep 'EXECUTABLE DIRECTORY' | sed 's/.*EXECUTABLE DIRECTORY: *//' | xargs):$PATH"
cd ios && pod install && cd ..
npx expo run:ios
```

---

## Yöntem 2: Script (hızlı)

Proje klasöründe:

```bash
chmod +x pod-install.sh
./pod-install.sh
```

Bittikten sonra:

```bash
npx expo run:ios
```

---

## Yöntem 2: Elle (kesin)

**1. Yeni bir terminal açın** (CocoaPods bu sayede PATH’te olabilir).

**2. Gem’in `pod` yolunu PATH’e ekleyin:**

```bash
export PATH="$(gem environment | grep 'EXECUTABLE DIRECTORY' | sed 's/.*EXECUTABLE DIRECTORY: *//' | xargs):$PATH"
```

**3. Kontrol edin:**

```bash
which pod
```

Bir path görünmeli (örn. `/usr/local/lib/ruby/gems/3.3.0/bin/pod`).

**4. Pod install çalıştırın:**

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
pod install
cd ..
```

**5. iOS’u çalıştırın:**

```bash
npx expo run:ios
```

---

## Hâlâ "pod: command not found" alıyorsanız

`pod`’un nerede olduğunu bulun:

```bash
gem environment
```

Çıktıdaki **EXECUTABLE DIRECTORY** satırındaki yolu kopyalayıp:

```bash
export PATH="/BURAYA_YAPISTIR/bin:$PATH"
```

örneğin:

```bash
export PATH="/usr/local/lib/ruby/gems/3.3.0/bin:$PATH"
```

Sonra tekrar:

```bash
cd /Users/info44technology.com/Desktop/bluecrew1/project/ios
pod install
cd ..
npx expo run:ios
```
