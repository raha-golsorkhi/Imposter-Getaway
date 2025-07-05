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

# 🗂️ Game Management Phases 

| Phase        | Category              | Responsibility    | Description                                                                 |
|--------------|-----------------------|-------------------|-----------------------------------------------------------------------------|
| 🎯 Phase 0   | **Game Setup**        | Host / Admin      | Set up QR code, Firebase project, and deploy app via Netlify                |
| ✅ Phase 1   | **Player Entry**      | Player            | Players scan QR code → enter name → added to Firestore → wait screen       |
| ▶️ Phase 2   | **Role Assignment**   | Host or Backend   | On host trigger: assign 1/3 of players as **Imposters**, rest as Civilians |
| ⏳ Phase 3   | **Game Phase (Chat + Voting)** | Player | Players move through small groups, sharing vacation stories (imposters lie, civilians tell the truth) while voting on others' roles using a live in-app panel. |      |
| ✅ Phase 4   | **Voting Phase** | Player | Players have 30 seconds to vote via UI. Each player casts two votes per person: (1) role guess — “Imposter” or “Civilian” and (2) story quality — rated from 1 to 5 stars. Both happen on the same voting panel. on the last minute(8th minute) after the discussion has started there would be a clockdown and for users that haven't submitted their votes, the votes get submitted automatically. |
| 🧮 Phase 5   | **Scoring & Results** | Backend or Host   | Count correct guesses → score players → identify winners                    |
| 🏁 Phase 6   | **Winners & Endgame** | Host              | Display top scorers and role reveal → announce prize winners                |