# Aplikacja do nauki KSR

Aplikacja wspomagająca naukę do odpowiedzi z **KSR** poprzez generowanie zadań ze Zbiorów Rozmytych.

## Jakie zadania zawiera aplikacja?

1. **Podstawy**
   - Obliczanie kardynalności zbioru ($card(A)$)
   - Wysokość zbioru ($hgt(A)$)
   - Wielkość nośnika ($|supp(A)|$)

2. **Operacje**
   - Suma zbiorów ($A \cup B$, t-konorma max)
   - Iloczyn zbiorów ($A \cap B$, t-norma min)
   - Dopełnienie zbioru ($A^c$)

3. **Przekroje**
   - Określanie elementów ostrego $\alpha$-przekroju

4. **Rozszerzone Operacje**
   - Różnica zbiorów ($A \setminus B$)
   - Suma Einsteina (s-norma $a \oplus b$)

5. **Miary Rozmycia**
   - Stopień rozmycia ($in(A)$)
   - Miara prawdziwości ($T_1$) dla podsumowań lingwistycznych (z kwantyfikatorem względnym)

Aplikacja posiada również wbudowane **podpowiedzi** do każdego zadania (instrukcje od Sensei Wu jak rozwiązać dany problem) oraz wyświetla poprawne rozwiązania, jeśli napotkasz trudności z własnymi obliczeniami.

## Uruchomienie aplikacji

1. **Zainstaluj wymagane zależności:**
   Upewnij się, że masz zainstalowane środowisko Node.js. Następnie w folderze projektu uruchom:

   ```bash
   npm install
   ```

2. **Uruchom serwer deweloperski:**
   Aby włączyć aplikację, wpisz komendę:

   ```bash
   npm run dev
   ```

3. **Otwórz w przeglądarce:**
   Po uruchomieniu serwera, w terminalu pojawi się lokalny adres (najczęściej `http://localhost:5173/`).

---

**_"Never put off until tomorrow what can be done today!" ~ Sensei Wu_**
