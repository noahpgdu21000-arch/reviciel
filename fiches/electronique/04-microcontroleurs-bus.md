---
id: elec-microcontroleurs
matiere: electronique
titre: Microcontrôleurs, Arduino et bus de communication
chapitre: Électronique — Systèmes embarqués
resume: Microcontrôleur ou microprocesseur, cartes Arduino / ESP32 / Raspberry Pi, structure d'un programme Arduino, bus UART, I2C, SPI et IoT.
mots-cles: microcontrôleur, système embarqué, Arduino, ATmega328P, ESP32, Raspberry Pi, setup, loop, pinMode, digitalWrite, analogRead, Serial, UART, I2C, SDA, SCL, SPI, MOSI, MISO, IoT, MQTT, LoRaWAN, 3,3 V
ordre: 4
---

## Microcontrôleur ou microprocesseur ?

- Un ==microcontrôleur== regroupe sur **une seule puce** : processeur, mémoire **flash** (programme), RAM et **entrées/sorties**. Il exécute une tâche dédiée : c'est le cœur des ==systèmes embarqués== (thermostat, alarme, objet connecté).
- Un ==microprocesseur== (celui d'un PC) a besoin de composants externes (RAM, stockage, chipset) et fait tourner un système d'exploitation complet.

| Carte | Particularités |
|---|---|
| ==Arduino Uno== | microcontrôleur ATmega328P, **5 V**, 16 MHz, 14 E/S numériques (dont 6 PWM), 6 entrées analogiques A0 à A5 (CAN 10 bits) |
| ==ESP32== | microcontrôleur avec **Wi-Fi et Bluetooth** intégrés, logique en ==3,3 V== (ne jamais lui envoyer 5 V sur une broche !) |
| ==Raspberry Pi== | ==nano-ordinateur== sous Linux (ce n'est pas un microcontrôleur) : serveur, domotique, supervision |

## La structure d'un programme Arduino (C/C++)

```cpp
const int LED = 13;        // broche de la LED
const int CAPTEUR = A0;    // entrée analogique

void setup() {             // exécuté UNE fois au démarrage
  pinMode(LED, OUTPUT);
  Serial.begin(9600);      // liaison série à 9600 bauds
}

void loop() {              // exécuté EN BOUCLE, à l'infini
  int valeur = analogRead(CAPTEUR);   // 0 à 1023
  Serial.println(valeur);
  if (valeur > 600) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }
  delay(500);              // pause de 500 ms
}
```

| Fonction | Rôle |
|---|---|
| `pinMode(broche, OUTPUT / INPUT / INPUT_PULLUP)` | configurer une broche |
| `digitalWrite(broche, HIGH / LOW)` | mettre une sortie à 1 ou 0 |
| `digitalRead(broche)` | lire une entrée numérique (0 ou 1) |
| `analogRead(A0)` | lire une tension (0 à 1 023) |
| `analogWrite(broche, 0-255)` | sortie PWM |
| `delay(ms)` / `millis()` | attendre / temps écoulé depuis le démarrage |
| `Serial.begin()` / `Serial.println()` | communiquer avec le PC (moniteur série) |

## Les bus de communication

| Bus | Fils | Fonctionnement | Exemples |
|---|---|---|---|
| ==UART== (liaison série) | **TX**, **RX** (+ masse) | asynchrone, point à point, débit en **bauds** (9 600, 115 200) ; TX d'un côté → RX de l'autre | module GPS, Bluetooth HC-05, moniteur série |
| ==I2C== | **SDA** (données), **SCL** (horloge) | synchrone, un maître et plusieurs esclaves ; chaque composant a une **adresse** (ex. 0x27, 0x3C) ; résistances de tirage | écrans LCD et OLED, capteurs |
| ==SPI== | **MOSI**, **MISO**, **SCK**, **CS** | synchrone, rapide ; un fil CS par esclave | carte SD, écrans TFT |
| 1-Wire | 1 fil de données | plusieurs capteurs sur un fil | sonde de température DS18B20 |

> [!attention] Deux règles de câblage
> - Relier les **masses (GND)** de toutes les cartes qui communiquent.
> - Respecter les **niveaux logiques** : un signal 5 V peut détruire une entrée 3,3 V (utiliser un pont diviseur ou un adaptateur de niveau).

## Les objets connectés (IoT)

- Un objet connecté envoie ses mesures sur le réseau : Wi-Fi (ESP32), Bluetooth, ou réseaux longue portée basse consommation (**LoRaWAN**, Sigfox).
- Le protocole ==MQTT== fonctionne par **publication / abonnement** : les objets publient sur des « topics » (ex. `atelier/temperature`) via un serveur appelé **broker**.
- Penser à la **sécurité** : changer les mots de passe par défaut, mettre à jour, isoler les objets dans un VLAN dédié.

> [!retenir]
> Microcontrôleur = tout sur une puce, tâche dédiée. Arduino : `setup()` une fois, `loop()` en boucle. UART = TX/RX, I2C = SDA/SCL + adresses, SPI = MOSI/MISO/SCK/CS. ESP32 = 3,3 V !

=== CARTES ===
Q: Qu'est-ce qu'un microcontrôleur ?
R: Un circuit qui regroupe **processeur, mémoire et entrées/sorties** sur une seule puce, pour une tâche dédiée.

Q: Différence entre setup() et loop() ?
R: **setup()** s'exécute **une fois** au démarrage ; **loop()** se répète **en boucle**.

Q: Plage de valeurs renvoyée par analogRead sur Arduino Uno ?
R: De **0 à 1 023** (CAN 10 bits).

Q: Tension logique de l'ESP32 ?
R: **3,3 V** (ne pas appliquer 5 V sur ses broches).

Q: Le Raspberry Pi est-il un microcontrôleur ?
R: **Non**, c'est un **nano-ordinateur** sous Linux.

Q: Fils du bus I2C ?
R: **SDA** (données) et **SCL** (horloge).

Q: Fils du bus SPI ?
R: **MOSI**, **MISO**, **SCK** et **CS** (sélection de l'esclave).

Q: Comment relier deux appareils en UART ?
R: **TX → RX** et **RX → TX** (croisés), avec la masse commune.

Q: Comment l'I2C distingue-t-il les composants ?
R: Chaque composant a une **adresse** (ex. 0x27).

Q: Comment fonctionne MQTT ?
R: Par **publication / abonnement** à des topics, via un serveur appelé **broker**.

=== QUIZ ===
? Quelle fonction configure la broche 7 en sortie ?
+ pinMode(7, OUTPUT);
- digitalWrite(7, OUTPUT);
- analogRead(7);
! pinMode sert à configurer une broche (dans setup()).

? Quel bus utilise une adresse pour chaque composant sur seulement 2 fils ?
- UART
+ I2C
- SPI
! I2C : SDA + SCL, chaque esclave a son adresse.

? Un module communique en UART mais rien ne s'affiche. Que vérifier en priorité ?
+ Le croisement TX/RX, le débit en bauds et la masse commune
- La couleur des fils
- La version de Windows
! En UART, TX doit aller sur RX, les deux côtés doivent avoir le même débit et la même masse.

? Pourquoi ne faut-il pas brancher un capteur 5 V directement sur une entrée d'ESP32 ?
- L'ESP32 n'a pas d'entrées
+ L'ESP32 fonctionne en 3,3 V : le 5 V peut l'endommager
- Le Wi-Fi serait coupé
! Il faut adapter le niveau logique (pont diviseur ou adaptateur).

? Combien de fois s'exécute la fonction loop() ?
- Une seule fois
- Dix fois
+ En boucle tant que la carte est alimentée
! loop() se répète indéfiniment.
