package config

// CompanyInfo contient les informations de l'entreprise
type CompanyInfo struct {
	Name        string
	Address     string
	City        string
	PostalCode  string
	Phone       string
	Fax         string
	Email       string
	Website     string
	SIRET       string
	APE         string
	TVA         string
	RCS         string
	Capital     string
	LogoPath    string
}

// GetCompanyInfo retourne les informations de l'entreprise
func GetCompanyInfo() CompanyInfo {
	return CompanyInfo{
		Name:       "ODI SERVICE PRO",
		Address:    "23 RUE ERIC TABARLY",
		City:       "DOMPIERRE SUR YON",
		PostalCode: "85170",
		Phone:      "02 51 99 36 91",
		Fax:        "",
		Email:      "aide.odiservicepro@gmail.com",
		Website:    "",
		SIRET:      "83377432600023",
		APE:        "8121Z",
		TVA:        "FR92833774326",
		RCS:        "833774326",
		Capital:    "500€",
		LogoPath:   "assets/logo.jpg",
	}
}

// DevisConfig contient la configuration pour les devis
type DevisConfig struct {
	DefaultCity        string
	DefaultConditions  string
	DefaultTVA         float64
	ValidityDays       int
	NumberingPrefix    string
}

// GetDevisConfig retourne la configuration des devis
func GetDevisConfig() DevisConfig {
	return DevisConfig{
		DefaultCity:        "DOMPIERRE SUR YON",
		DefaultConditions:  "Devis valable 30 jours. Paiement à réception de facture.",
		DefaultTVA:         20.0,
		ValidityDays:       30,
		NumberingPrefix:    "DEV",
	}
}
