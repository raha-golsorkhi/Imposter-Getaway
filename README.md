# Imposter-Getaway
This project is dedicated to the Branch Day at Ministry of Children, Youth, community and Social Services of my 2025 Co-op term.

Game Summary
* Name: Imposter Getaway
* Players: Attendees scan QR → Join game
* Roles:
    * 1/3 assigned Imposters (must lie)
    * 2/3 assigned Civilians (must tell the truth)
* Gameplay:
    * Players chat in person within a group about vacations
    * Each player gets 1 minute.
* Voting:
    * Each player votes on others as “Imposter” or “Civilian”
    * Voting screen includes search bar & names
* Scoring:
    * Players earn points for correct guesses
    * Best Imposter, Best Civilian, and Top Guessers win prizes
* Duration: ~10–12 minutes total

## 🧰 Tech Stack Summary

| Layer     | Tech                        | Why It’s Good                                               |
|-----------|-----------------------------|--------------------------------------------------------------|
| Frontend  | React + Tailwind CSS        | Fast UI, works perfectly on phones                           |
| Hosting   | Netlify                     | Easy deploy, secure, great with React                        |
| Database  | Firebase Firestore          | No server needed, real-time updates, reliable                |
| Auth      | Name-based entry (no login) | Simple & low-friction for event use                          |
| Logic     | Firebase Functions          | For role assignment or scoring automation                   |
| QR Code   | Static link to Netlify app  | Easy to generate, attendees scan to play                     |


🔄 Workflow Summary
1. Join: Attendees enter name → added to Firebase
2. Assign Roles: Button or trigger sets roles (random 1/3 imposters)
3. Role Reveal: Role shown on phone with instruction
4. Storytime: Players chat based on role (truth or lie)
5. Voting Phase: UI lists names → vote with imposter/civilian guesses
6. Scoring: Firebase checks guesses vs real roles → scores everyone
7. Winners Announced: Top 5 revealed for prizes
