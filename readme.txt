

0. Prije svega treba instalirati Docker Desktop !!!


1. Lokalna Konfiguracija (.env)
Prije prvog pokretanja, osigurajte da je vaša .env datoteka u korijenskom direktoriju backend ispravno postavljena. Ključno je koristiti port 5434 kako biste izbjegli sukobe s ostalim aplikacijama.

DB_HOST=127.0.0.1
DB_PORT=5434
DB_NAME=sceduly_db
DB_USER=postgres
DB_PASSWORD=my_secret
JWT_SECRET=neki_secret


----------------------------------------


2. Komande za Pokretanje Projekta

Sve navedene komande izvršite unutar backend direktorija projekta.  /backend


- Ova je komanda obavezna pri prvom pokretanju ili nakon velikih promjena u konfiguraciji baze.

docker compose down -v --rmi all     [Briše stare kontejnere, Volume-e (uključujući podatke baze!) i sve kreirane Docker slike. Osigurava čisti start.]
docker compose up -d --build         [Pokreće servise u pozadini (-d) i prisiljava ponovnu izgradnju (--build) backend slike, osiguravajući da se koristi najnoviji kod i .env]
npm run start:migration		     [stvara migracije]


Za buduće pokretanje/gašenje kontejnera:

docker compose up -d
docker compose down

-------------------------------------------

3. Pristup Aplikaciji i Bazi

Nakon uspješnog pokretanja, aplikaciji i bazi pristupate na sljedeće adrese:

Backend Aplikacija  ------->  http://localhost:5001

PostgreSQL Baza ----------->  Host: 127.0.0.1, Port: 5434