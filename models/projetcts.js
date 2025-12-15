const mongoose = require('mongoose');

const projetSchema = new mongoose.Schema({
  // ========================================
  // INFORMATIONS GÉNÉRALES
  // ========================================
  promoteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le promoteur est requis']
  },
  
  titre: {
    type: String,
    required: [true, 'Le titre du projet est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [5000, 'La description ne peut pas dépasser 5000 caractères']
  },
  
  typeBien: {
    type: String,
    enum: [
      'appartement',
      'villa',
      'studio',
      'bureau',
      'local_commercial',
      'terrain_industriel',
      'terrain_agricole',
      'terrain_residentiel',
      'immeuble',
      'riad',
      'penthouse'
    ],
    required: [true, 'Le type de bien est requis']
  },
  
  statut: {
    type: String,
    enum: ['a_venir', 'en_cours', 'termine', 'vendu'],
    default: 'en_cours'
  },
  
  prix: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix doit être positif']
  },
  
  devise: {
    type: String,
    enum: ['MAD', 'EUR', 'USD'],
    default: 'MAD'
  },
  
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  
  dateFinPrevue: {
    type: Date
  },
  
  // ========================================
  // IMAGES
  // ========================================
  imagePrincipale: {
    type: String,
    required: [true, 'L\'image principale est requise']
  },
  
  galerie: [{
    type: String,
    maxlength: 10 // Maximum 10 images
  }],
  
  // ========================================
  // LOCALISATION (REQUIS)
  // ========================================
  localisation: {
    adresse: {
      type: String,
      required: [true, 'L\'adresse est requise']
    },
    ville: {
      type: String,
      required: [true, 'La ville est requise']
    },
    codePostal: {
      type: String
    },
    quartier: {
      type: String
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'La latitude est requise'],
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: [true, 'La longitude est requise'],
        min: -180,
        max: 180
      }
    }
  },
  
  // ========================================
  // CARACTÉRISTIQUES COMMUNES
  // ========================================
  caracteristiques: {
    surfaceTotale: {
      type: Number,
      required: [true, 'La surface totale est requise'],
      min: [0, 'La surface doit être positive']
    },
    
    // APPARTEMENT / VILLA / STUDIO / PENTHOUSE
    nombreChambres: {
      type: Number,
      min: 0
    },
    nombreSallesBain: {
      type: Number,
      min: 0
    },
    nombreSallesEau: {
      type: Number,
      min: 0
    },
    etage: {
      type: Number
    },
    ascenseur: {
      type: Boolean,
      default: false
    },
    balcon: {
      type: Boolean,
      default: false
    },
    terrasse: {
      type: Boolean,
      default: false
    },
    surfaceTerrasse: {
      type: Number,
      min: 0
    },
    garage: {
      type: Boolean,
      default: false
    },
    nombrePlacesParking: {
      type: Number,
      min: 0
    },
    
    // VILLA / RIAD
    surfaceTerrain: {
      type: Number,
      min: 0
    },
    jardin: {
      type: Boolean,
      default: false
    },
    piscine: {
      type: Boolean,
      default: false
    },
    
    // BUREAU / LOCAL COMMERCIAL
    openSpace: {
      type: Boolean,
      default: false
    },
    nombreBureaux: {
      type: Number,
      min: 0
    },
    salleReunion: {
      type: Boolean,
      default: false
    },
    mezzanine: {
      type: Boolean,
      default: false
    },
    hauteurSousPlafond: {
      type: Number,
      min: 0
    },
    vitrine: {
      type: Boolean,
      default: false
    },
    
    // TERRAIN
    constructible: {
      type: Boolean,
      default: false
    },
    viabilise: {
      type: Boolean,
      default: false
    },
    zoneConstruction: {
      type: String,
      enum: ['residentielle', 'commerciale', 'industrielle', 'agricole', 'mixte']
    },
    
    // ÉQUIPEMENTS GÉNÉRAUX
    climatisation: {
      type: Boolean,
      default: false
    },
    chauffage: {
      type: Boolean,
      default: false
    },
    cuisine: {
      type: String,
      enum: ['equipee', 'semi_equipee', 'non_equipee']
    },
    meuble: {
      type: Boolean,
      default: false
    },
    securite: {
      type: Boolean,
      default: false
    },
    gardien: {
      type: Boolean,
      default: false
    }
  },
  
  // ========================================
  // PHASES D'AVANCEMENT
  // ========================================
  phases: [{
    numero: {
      type: Number,
      required: true
    },
    titre: {
      type: String,
      required: [true, 'Le titre de la phase est requis'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La description de la phase est requise']
    },
    pourcentageAvancement: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    dateDebut: {
      type: Date
    },
    dateFin: {
      type: Date
    },
    images: [{
      type: String,
      maxlength: 5 // Max 5 images par phase
    }],
    statut: {
      type: String,
      enum: ['non_commence', 'en_cours', 'termine'],
      default: 'non_commence'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ========================================
  // MÉTADONNÉES
  // ========================================
  vues: {
    type: Number,
    default: 0
  },
  
  favoris: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  actif: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true
});

// Index pour améliorer les performances
projetSchema.index({ promoteur: 1, statut: 1 });
projetSchema.index({ typeBien: 1, 'localisation.ville': 1 });
projetSchema.index({ prix: 1 });
projetSchema.index({ createdAt: -1 });

// Méthode pour calculer le pourcentage global d'avancement
projetSchema.methods.calculerAvancementGlobal = function() {
  if (this.phases.length === 0) return 0;
  
  const totalPourcentage = this.phases.reduce((sum, phase) => {
    return sum + phase.pourcentageAvancement;
  }, 0);
  
  return Math.round(totalPourcentage / this.phases.length);
};

// Méthode virtuelle pour l'avancement global
projetSchema.virtual('avancementGlobal').get(function() {
  return this.calculerAvancementGlobal();
});

// Assurer que les virtuals sont inclus lors de la sérialisation JSON
projetSchema.set('toJSON', { virtuals: true });
projetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Projet', projetSchema);