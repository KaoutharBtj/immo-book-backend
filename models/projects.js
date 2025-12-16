const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({

    promoteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le promoteur est requis']
    },

    titre: {
        type: String,
        required: [true,'Le titre du projet est requis'],
        trim: true,
        maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },

    description: {
        type: String,
        required: [true,'La description est requise'],
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

    dateDebut: {
        type: Date,
        required: [true,  'La date de début est requise']
    },

    dateFinPrevue: {
        type: Date
    },

    imagePrincipale: {
        type: String,
        required: [true,  'L\'image principale est requise']
    },

    galerie: {
        type: [String],
        validate: [arr => arr.length <= 10, 'Maximum 5 images autorisées']
    },

    localisation: {
        adresse: {
            type: String,
            required: [true,  'L\'adresse est requise']
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

    phases: [{
        numero: {
            type: Number,
            required: true
        },

        titre: {
            type: String,
            required: [true,  'Le titre de la phase est requis'],
            trim: true
        },

        description: {
            type: String,
            required: [true, 'La description de la phase est requise']
        },

        dateDebut: {
            type: Date
        },

        dateFin: {
            type: Date
        },

        images: {
            type: [String],
            validate: [arr => arr.length <= 5, 'Maximum 5 images autorisées']
        },

        statut: {
            type: String,
            enum: ['non_commence', 'en_cours', 'termine'],
            default: 'non_commence'
        },

    }],

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

projectSchema.index({promoteur: 1, statut: 1});
projectSchema.index({typeBien: 1, 'localisation.ville': 1});
projectSchema.index({prix: 1});
projectSchema.index({createdAt: -1});

module.exports = mongoose.model('Project', projectSchema)