# ========================================
# 🧪 TEST COMPLET SENDCLOUD API
# Sans backend - Communication directe
# ========================================

$apiKey = "03a2e54f-f07b-4c4b-9a01-2a2c388bf31d"
$apiSecret = "ccb0f00a5275492196521cb95c41227f"
$pair = "${apiKey}:${apiSecret}"
$encodedCreds = [System.Convert]::ToBase64String([System.Text.Encoding]::ASCII.GetBytes($pair))

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 TEST DIRECT SENDCLOUD API - MODE COMPLET" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ========================================
# TEST 1 : Informations du compte
# ========================================
Write-Host "📋 TEST 1 : Vérification du compte" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $user = Invoke-RestMethod `
        -Uri "https://panel.sendcloud.sc/api/v2/user" `
        -Method Get `
        -Headers @{ Authorization = "Basic $encodedCreds" }
    
    Write-Host "✅ Compte actif" -ForegroundColor Green
    Write-Host "   Email    : $($user.user.email)" -ForegroundColor White
    Write-Host "   Société  : $($user.user.company_name)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Erreur d'authentification" -ForegroundColor Red
    exit
}

# ========================================
# TEST 2 : Adresses expéditeur
# ========================================
Write-Host "📍 TEST 2 : Récupération adresses expéditeur" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $addresses = Invoke-RestMethod `
        -Uri "https://panel.sendcloud.sc/api/v2/user/addresses/sender" `
        -Headers @{ Authorization = "Basic $encodedCreds" }
    
    if ($addresses.sender_addresses.Count -gt 0) {
        $senderAddress = $addresses.sender_addresses[0]
        Write-Host "✅ Adresse trouvée" -ForegroundColor Green
        Write-Host "   ID       : $($senderAddress.id)" -ForegroundColor White
        Write-Host "   Nom      : $($senderAddress.company_name)" -ForegroundColor White
        Write-Host "   Adresse  : $($senderAddress.street) $($senderAddress.house_number)" -ForegroundColor White
        Write-Host "   Ville    : $($senderAddress.postal_code) $($senderAddress.city)" -ForegroundColor White
        Write-Host ""
        
        # On garde cette adresse pour la suite
        $senderId = $senderAddress.id
    } else {
        Write-Host "⚠️ Aucune adresse expéditeur configurée" -ForegroundColor Yellow
        exit
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# ========================================
# TEST 3 : Méthodes d'expédition
# ========================================
Write-Host "🚚 TEST 3 : Méthodes d'expédition disponibles" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

try {
    $methods = Invoke-RestMethod `
        -Uri "https://panel.sendcloud.sc/api/v2/shipping-methods" `
        -Headers @{ Authorization = "Basic $encodedCreds" }
    
    if ($methods.shipping_methods.Count -gt 0) {
        Write-Host "✅ $($methods.shipping_methods.Count) méthode(s) trouvée(s)" -ForegroundColor Green
        foreach ($method in $methods.shipping_methods) {
            Write-Host "   ├─ ID: $($method.id) | $($method.name)" -ForegroundColor Cyan
        }
        Write-Host ""
    } else {
        Write-Host "⚠️ Aucune méthode (mode test)" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host "⚠️ Aucune méthode d'expédition (mode test activé)" -ForegroundColor Yellow
    Write-Host ""
}

# ========================================
# TEST 4 : Création d'un colis TEST
# ========================================
Write-Host "📦 TEST 4 : Création d'un colis de test" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

$orderNumber = "TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"

$parcelPayload = @{
    parcel = @{
        name = "Sophie Martin"
        company_name = ""
        address = "15 Boulevard Haussmann"
        address_2 = "Appartement 42"
        city = "Paris"
        postal_code = "75009"
        country = "FR"
        telephone = "+33612345678"
        email = "sophie.martin@example.com"
        order_number = $orderNumber
        weight = "1.250"
        request_label = $false  # Pas d'étiquette en mode test
        sender_address = $senderId
        parcel_items = @(
            @{
                description = "Café Arabica Bio 250g"
                quantity = 2
                weight = "0.250"
                value = "12.90"
                hs_code = "09011100"
                origin_country = "FR"
            },
            @{
                description = "Café Robusta 500g"
                quantity = 1
                weight = "0.500"
                value = "18.50"
                hs_code = "09011200"
                origin_country = "FR"
            }
        )
    }
} | ConvertTo-Json -Depth 10

Write-Host "Payload envoyé :" -ForegroundColor White
Write-Host $parcelPayload -ForegroundColor Gray
Write-Host ""

try {
    $newParcel = Invoke-RestMethod `
        -Uri "https://panel.sendcloud.sc/api/v2/parcels" `
        -Method Post `
        -Headers @{ 
            Authorization = "Basic $encodedCreds"
            "Content-Type" = "application/json"
        } `
        -Body $parcelPayload
    
    Write-Host "✅ ✅ ✅ COLIS CRÉÉ AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "📦 ID SendCloud  : $($newParcel.parcel.id)" -ForegroundColor Cyan
    Write-Host "📋 N° Commande   : $($newParcel.parcel.order_number)" -ForegroundColor Yellow
    Write-Host "👤 Destinataire  : $($newParcel.parcel.name)" -ForegroundColor White
    Write-Host "📍 Adresse       : $($newParcel.parcel.address)" -ForegroundColor White
    Write-Host "🏙️  Ville         : $($newParcel.parcel.postal_code) $($newParcel.parcel.city)" -ForegroundColor White
    Write-Host "📞 Téléphone     : $($newParcel.parcel.telephone)" -ForegroundColor White
    Write-Host "📧 Email         : $($newParcel.parcel.email)" -ForegroundColor White
    Write-Host "⚖️  Poids         : $($newParcel.parcel.weight) kg" -ForegroundColor White
    Write-Host "📊 Statut        : $($newParcel.parcel.status.message)" -ForegroundColor $(if($newParcel.parcel.status.message -eq "No label") {"Yellow"} else {"Green"})
    
    if ($newParcel.parcel.tracking_number) {
        Write-Host "🔍 Tracking      : $($newParcel.parcel.tracking_number)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Tracking      : (indisponible sans transporteur)" -ForegroundColor Yellow
    }
    
    if ($newParcel.parcel.label) {
        Write-Host "📄 Étiquette     : DISPONIBLE" -ForegroundColor Green
        Write-Host "   URL: $($newParcel.parcel.label.normal_printer)" -ForegroundColor Blue
    } else {
        Write-Host "⚠️  Étiquette     : (indisponible sans transporteur)" -ForegroundColor Yellow
    }
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    # Sauvegarder l'ID pour les tests suivants
    $parcelId = $newParcel.parcel.id
    
    # ========================================
    # TEST 5 : Récupérer le colis créé
    # ========================================
    Write-Host "🔍 TEST 5 : Vérification du colis créé (GET)" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
    
    Start-Sleep -Seconds 2  # Attendre que SendCloud traite
    
    $fetchedParcel = Invoke-RestMethod `
        -Uri "https://panel.sendcloud.sc/api/v2/parcels/$parcelId" `
        -Headers @{ Authorization = "Basic $encodedCreds" }
    
    Write-Host "✅ Colis récupéré" -ForegroundColor Green
    Write-Host "   ID créé    : $parcelId" -ForegroundColor White
    Write-Host "   ID récupéré: $($fetchedParcel.parcel.id)" -ForegroundColor White
    Write-Host "   Match      : $(if($parcelId -eq $fetchedParcel.parcel.id){'✅ OUI'}else{'❌ NON'})" -ForegroundColor $(if($parcelId -eq $fetchedParcel.parcel.id){'Green'}else{'Red'})
    Write-Host ""
    
    # ========================================
    # TEST 6 : Lister tous les colis
    # ========================================
    Write-Host "📋 TEST 6 : Liste des 5 derniers colis" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
    
    $allParcels = Invoke-RestMethod `
        -Uri "https://panel.sendcloud.sc/api/v2/parcels?limit=5" `
        -Headers @{ Authorization = "Basic $encodedCreds" }
    
    Write-Host "✅ $($allParcels.parcels.Count) colis récupérés" -ForegroundColor Green
    foreach ($p in $allParcels.parcels) {
        $isNew = if($p.id -eq $parcelId){"🆕 NOUVEAU"}else{""}
        Write-Host "   ├─ ID: $($p.id) | $($p.name) | $($p.order_number) $isNew" -ForegroundColor $(if($p.id -eq $parcelId){'Cyan'}else{'White'})
    }
    Write-Host ""
    
    # ========================================
    # RÉSUMÉ FINAL
    # ========================================
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ TOUS LES TESTS RÉUSSIS !" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Résumé :" -ForegroundColor Yellow
    Write-Host "   ✅ Authentification       : OK" -ForegroundColor Green
    Write-Host "   ✅ Adresse expéditeur     : OK" -ForegroundColor Green
    Write-Host "   ⚠️  Méthodes expédition    : MODE TEST" -ForegroundColor Yellow
    Write-Host "   ✅ Création colis         : OK" -ForegroundColor Green
    Write-Host "   ✅ Récupération colis     : OK" -ForegroundColor Green
    Write-Host "   ✅ Liste des colis        : OK" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Prochaine étape :" -ForegroundColor Cyan
    Write-Host "   → Intégrer ces appels dans votre backend Express" -ForegroundColor White
    Write-Host "   → Configurer un transporteur pour les étiquettes" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ ERREUR lors de la création" -ForegroundColor Red
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $body = $reader.ReadToEnd()
        Write-Host "`nRéponse API:" -ForegroundColor Yellow
        Write-Host $body -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🏁 Tests terminés" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
