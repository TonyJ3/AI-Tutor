# Aristotle AI

#### Wat is Aristotle AI?
Aristotle AI is de persoonlijke AI tutor die de student een simulatie biedt van de 1 op 1 begeleiding die leraar geeft in een klaslokaal, maar dan 24/7 en op al je apparateten te verkrijgen. Dit krachtig vooruit strevende tool maakt het eenvoudig voor de leerling om de benodigde hulp, controles en inzichten te bekijken en te ontvangen. Hiernaast is het een goede support tool voor de leraren. 

in de hand over document vind u nog meer diepgang in de werking werking van de applicatie en hoe je bijvoorbeeld je eigen API key, kunt bemachtigen en de database kunt opzetten, maar ook het opzetten van je eigen assistant met daarin de juiste gedragregels die er toegepast moeten worden. Alle pagina's worden apart uitgelicht met hun functie en er is gekeken naar de toekomst om voorstellen te doen over wat er allemaal verbeterd zou kunnen worden om het een betere applicatie te maken.

### installatie
De installatie van de app vereist een aantal stappen. Wanneer je deze git cloned heb je de gescheiden mapjes: 'front-end' & 'Back-end'. Deze twee mapjes dienen beide voor een andere purpose. Als we de front-end mapje openen en daar opzoek gaan naar het index.html bestand, dan dient dit als je 'startpagina'. Dit bestand wil je runnen om de app visueel te laten zien op het internet. Dit kan gemakelijk met een extensie in je IDE genaamd: Live Server. Wanneer je deze extensie hebt geinstaleerd kan je op de index.html file je rechtermuisknop gebruiken om dan naar de optie: 'Open with Live Server' te drukken. Wanneer je hier op hebt gedrukt wordt er een lokale server gestart waar de app op zou runnen. Dit opent automatisch op je webbrowser. Dit dient nu als het visuele aspect waar je kan inloggen en naar de verschillende pagina's kunt navigeren. 

Om de werkingen te activeren van functies zoals documenten uploaden. Zou je de Back-end moeten opstarten. Hiervoor heb je als eerste een virtual environment nodig in python. Dit kan je aanmaken door: 

```python
python3 -m venv .venv
```
Om deze environment vervolgens te activeren moet je het volgende doen. Als eerste naar naar het mapje toe die nu automatisch is aangemaakt nadat je de vevv command hebt uitgevoerd.

```python
cd venv
```
Vervolgens gaan we onze weg maken naar de 'Scripts' mapje
```python
cd Scripts
```
Hier gaan we dan onze venv activeren.
```python
activate
```
Nu zal je in je venv zitten. Dit zie je ook onderaan in je terminal omdat er (venv) staat voor je terminal mappen structuur. We gaan nu weer terug uit de 'Scripts' map om naar de 'Back-end' mapje te gaan. Dit doe je door simpelweg 2x de command:

```python
cd ../
```
Nu we weer op de back-end directory zitten gaan we alle packages downloaden om alles te laten werken door middel van:
```python
pip install -r requirements. txt
```
Met deze packages allemaal geinstalleerd kunnen we de back-end opstarten. in de terminal type je:
```python
uvicorn assistant_api:app --reload
```
Nadat je dit hebt gedaan zie je in de terminal dat de applicatie startup is gelukt. Dit betekend dat alle functies van de Back-end het nu doen. Om de server te stoppen gebruik je: CTRL + 'C'.

### Tech stack

- HTMl
- CSS
- Javascript
- Python
- OpenAI Assistant
- Supabase
- Uvicorn
- Fastapi

#### Auteurs:

- Darchinou Girigorie
- Tony Jiang
- Sander van der Plas
- Isaï Leene
- Le Thi Thuy Ly Phan

Minor AI for society git omgeving 2025
