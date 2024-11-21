;; Cryptographic Scavenger Hunt

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-solved (err u102))
(define-constant err-incorrect-solution (err u103))
(define-constant err-hunt-not-started (err u104))
(define-constant err-hunt-ended (err u105))

;; Data variables
(define-data-var hunt-started bool false)
(define-data-var hunt-ended bool false)
(define-data-var current-stage uint u0)
(define-data-var prize uint u0)

;; Maps
(define-map stages uint {clue: (string-ascii 256), solution: (string-ascii 64), next-stage: uint})
(define-map participant-progress principal uint)

;; Public functions
(define-public (start-hunt)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (var-get hunt-started)) err-hunt-not-started)
    (var-set hunt-started true)
    (ok true)
  )
)

(define-public (end-hunt)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (var-get hunt-started) err-hunt-not-started)
    (var-set hunt-ended true)
    (ok true)
  )
)

(define-public (add-stage (stage-number uint) (clue (string-ascii 256)) (solution (string-ascii 64)) (next-stage uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (var-get hunt-started)) err-hunt-not-started)
    (map-set stages stage-number
      {
        clue: clue,
        solution: solution,
        next-stage: next-stage
      }
    )
    (var-set current-stage (+ u1 (var-get current-stage)))
    (ok true)
  )
)

(define-public (submit-solution (stage uint) (solution (string-ascii 64)))
  (let (
    (stage-data (unwrap! (map-get? stages stage) err-not-found))
    (participant-stage (default-to u0 (map-get? participant-progress tx-sender)))
  )
    (asserts! (var-get hunt-started) err-hunt-not-started)
    (asserts! (not (var-get hunt-ended)) err-hunt-ended)
    (asserts! (is-eq stage participant-stage) err-incorrect-solution)
    (asserts! (is-eq solution (get solution stage-data)) err-incorrect-solution)
    (map-set participant-progress tx-sender (get next-stage stage-data))
    (if (is-eq (get next-stage stage-data) u0)
      (begin
        (try! (as-contract (stx-transfer? (var-get prize) tx-sender tx-sender)))
        (var-set hunt-ended true)
        (ok "Congratulations! You've completed the hunt and won the prize!")
      )
      (ok (get clue (unwrap-panic (map-get? stages (get next-stage stage-data)))))
    )
  )
)

(define-public (get-current-clue)
  (let (
    (participant-stage (default-to u0 (map-get? participant-progress tx-sender)))
    (stage-data (unwrap! (map-get? stages participant-stage) err-not-found))
  )
    (asserts! (var-get hunt-started) err-hunt-not-started)
    (asserts! (not (var-get hunt-ended)) err-hunt-ended)
    (ok (get clue stage-data))
  )
)

(define-public (set-prize (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (not (var-get hunt-started)) err-hunt-not-started)
    (var-set prize amount)
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-participant-progress (participant principal))
  (ok (default-to u0 (map-get? participant-progress participant)))
)

(define-read-only (is-hunt-active)
  (and (var-get hunt-started) (not (var-get hunt-ended)))
)
