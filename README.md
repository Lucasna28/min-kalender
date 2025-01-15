Jeg kan se at frontend-delen fungerer korrekt, da den kalder funktionen med de rigtige parametre og håndterer svar/fejl korrekt.
Det ser ud til at problemet sandsynligvis ligger i selve SQL-funktionen accept_calendar_invitation, men jeg kan ikke finde definitionen af denne funktion i codebasen. Dette kunne tyde på at:
Enten er SQL-funktionen ikke blevet committed til git-repositoriet
2. Eller også er den defineret direkte i databasen uden at være versionsstyret
Jeg vil foreslå at vi:
Først tjekker om SQL-funktionen eksisterer i databasen
Derefter undersøger dens implementation for at se om der er fejl i logikken
Vil du have mig til at generere SQL til at:
Tjekke om funktionen eksisterer?
Se dens definition hvis den findes?
Eller vil du hellere selv køre disse queries direkte i databasen?