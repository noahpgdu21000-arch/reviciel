---
id: maths-suites
matiere: maths
titre: Suites arithmétiques et géométriques
chapitre: Algèbre — Analyse
resume: Reconnaître une suite arithmétique ou géométrique, calculer un terme, l'appliquer aux évolutions et aux intérêts.
mots-cles: suite, terme, rang, arithmétique, raison, géométrique, intérêts simples, intérêts composés, évolution, Python
ordre: 4
---

## Qu'est-ce qu'une suite ?

Une ==suite== est une liste ordonnée de nombres : u~0~, u~1~, u~2~… Le nombre u~n~ est le ==terme de rang n==.

## Suite arithmétique : on ajoute toujours le même nombre

> [!formule]
> u~n+1~ = u~n~ + r   (r = la raison)
> u~n~ = u~0~ + n × r   ou   u~n~ = u~1~ + (n − 1) × r

- Si **r > 0** la suite est croissante, si **r < 0** elle est décroissante.
- Les points (n ; u~n~) sont ==alignés== sur une droite.
- Situations : une quantité qui augmente d'un **même nombre** à chaque étape (abonnement +2 € par mois, ==intérêts simples==).

> [!exemple]
> Un technicien a 1 500 € sur un compte et ajoute 120 € chaque mois : u~n~ = 1 500 + 120n. Après 10 mois : u~10~ = 1 500 + 1 200 = **2 700 €**.

## Suite géométrique : on multiplie toujours par le même nombre

> [!formule]
> u~n+1~ = u~n~ × q   (q = la raison)
> u~n~ = u~0~ × q^n^   ou   u~n~ = u~1~ × q^n−1^

- Avec u~0~ > 0 : si **q > 1** la suite est croissante ; si **0 < q < 1** elle est décroissante.
- Situations : une quantité qui évolue d'un **même pourcentage** à chaque étape. Une hausse de t % donne **q = 1 + t/100**, une baisse de t % donne **q = 1 − t/100**. C'est le cas des ==intérêts composés==.

> [!exemple]
> 1 000 € placés à 3 % par an : u~n~ = 1 000 × 1,03^n^. Après 5 ans : 1 000 × 1,03^5^ ≈ **1 159,27 €**.

## Reconnaître le type de suite

| Test | Conclusion |
|---|---|
| u~n+1~ − u~n~ est toujours le même nombre | arithmétique de raison r = cette différence |
| u~n+1~ / u~n~ est toujours le même nombre | géométrique de raison q = ce quotient |

Exemple : 3 ; 6 ; 12 ; 24 → les quotients valent 2 → géométrique de raison 2. Et 3 ; 6 ; 9 ; 12 → les différences valent 3 → arithmétique de raison 3.

## Calculer les termes avec Python

```python
u = 1000          # u0
for n in range(5):
    u = u * 1.03  # suite géométrique de raison 1,03
print(round(u, 2))  # 1159.27
```

> [!retenir]
> Arithmétique : **+ r** à chaque étape, u~n~ = u~0~ + nr. Géométrique : **× q** à chaque étape, u~n~ = u~0~ × q^n^. Une évolution de t % par étape donne une suite géométrique de raison 1 ± t/100.

=== EXERCICES ===
# calcul : Suites arithmétiques et géométriques
? Suite arithmétique : u~0~ = 4 et r = 3. Calcule u~5~.
= 19
! u~5~ = 4 + 5 × 3 = 19.
? Suite géométrique : u~0~ = 2 et q = 3. Calcule u~4~.
= 162
! 2 × 3^4^ = 2 × 81 = 162.
? 1 000 € placés à 2 % par an (intérêts composés). Capital après 3 ans (en €) ?
= 1061,21 € ± 0,02
! 1 000 × 1,02^3^ ≈ 1 061,21 €.
? Raison de la suite géométrique pour une baisse de 5 % par an ?
= 0,95

# classer : Arithmétique ou géométrique ?
Arithmétique : 5 / 8 / 11 / 14, 100 / 90 / 80 / 70, un salaire qui augmente de 50 € par an
Géométrique : 3 / 6 / 12 / 24, 1000 / 500 / 250 / 125, un prix qui augmente de 2 % par an

=== CARTES ===
Q: Relation de récurrence d'une suite arithmétique ?
R: u~n+1~ = u~n~ + r (on ajoute toujours la raison r).

Q: Terme général d'une suite arithmétique ?
R: u~n~ = u~0~ + n × r

Q: Relation de récurrence d'une suite géométrique ?
R: u~n+1~ = u~n~ × q (on multiplie toujours par la raison q).

Q: Terme général d'une suite géométrique ?
R: u~n~ = u~0~ × q^n^

Q: Une hausse de 5 % par an donne une suite géométrique de raison… ?
R: q = **1,05**

Q: Intérêts simples ou composés : lequel donne une suite géométrique ?
R: Les intérêts **composés** (les intérêts simples donnent une suite arithmétique).

Q: Comment reconnaît-on une suite arithmétique ?
R: La **différence** entre deux termes consécutifs est constante.

Q: Allure graphique d'une suite arithmétique ?
R: Des points **alignés** sur une droite.

=== QUIZ ===
? Suite arithmétique avec u~0~ = 5 et r = 3. Que vaut u~4~ ?
- 15
+ 17
- 20
! u~4~ = 5 + 4 × 3 = 17.

? La suite 2 ; 6 ; 18 ; 54 est…
- arithmétique de raison 4
+ géométrique de raison 3
- ni l'une ni l'autre
! Chaque terme est multiplié par 3.

? Suite géométrique avec u~0~ = 100 et q = 0,5. Que vaut u~3~ ?
- 50
- 150
+ 12,5
! 100 × 0,5^3^ = 100 × 0,125 = 12,5.

? Une population de bactéries double chaque heure. Quel modèle ?
- Suite arithmétique de raison 2
+ Suite géométrique de raison 2
- Suite arithmétique de raison 100
! « Doubler » = multiplier par 2 à chaque étape.

? Un loyer de 600 € baisse de 2 % par an. Raison de la suite géométrique ?
- 0,2
- 1,02
+ 0,98
! Baisse de 2 % : q = 1 − 0,02 = 0,98.
