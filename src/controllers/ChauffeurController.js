import HttpError from "../config/HttpError.js";
import Trajet from "../models/Trajet.js";
import Pneu from "../models/Pneu.js";
import PDFDocument from "pdfkit";

export const getMesTrajets = async (req, res) => {
    const chauffeurId = req.user.userId;
    const { statut } = req.query;
    
    const filter = { chauffeur: chauffeurId };
    if (statut) filter.statut = statut;

    const trajets = await Trajet.find(filter)
        .populate('chauffeur', 'username email')
        .populate({
            path: 'camion',
            select: 'marque immatriculation kilometrage disponible',
            populate: {
                path: 'remorqueAttachee',
                select: 'marque numeroSerie capaciteCharge etat'
            }
        })
        .populate('remorque', 'marque numeroSerie')
        .sort({ dateDepart: -1 });

    res.status(200).json(trajets);
};

export const getMonTrajet = async (req, res) => {
    const { id } = req.params;
    const chauffeurId = req.user.userId;
    
    const trajet = await Trajet.findOne({ _id: id, chauffeur: chauffeurId })
        .populate('chauffeur', 'username email')
        .populate({
            path: 'camion',
            select: 'marque immatriculation kilometrage disponible',
            populate: {
                path: 'remorqueAttachee',
                select: 'marque numeroSerie capaciteCharge etat'
            }
        })
        .populate('remorque', 'marque numeroSerie');

    if (!trajet) {
        throw new HttpError("Trajet not found or not assigned to you", 404);
    }

    res.status(200).json(trajet);
};

export const getMesPneus = async (req, res) => {
    const chauffeurId = req.user.userId;
    
    // Get active trajets for the chauffeur
    const activeTrajets = await Trajet.find({
        chauffeur: chauffeurId,
        statut: { $in: ["Planifie", "En cours"] }
    }).populate('camion remorque');

    if (!activeTrajets || activeTrajets.length === 0) {
        return res.status(200).json([]);
    }

    const vehiculeIds = [];
    const vehiculeTypes = [];

    // Collect all vehicles from active trips
    activeTrajets.forEach(trajet => {
        if (trajet.camion) {
            vehiculeIds.push(trajet.camion._id);
            vehiculeTypes.push('Camion');
        }
        if (trajet.remorque) {
            vehiculeIds.push(trajet.remorque._id);
            vehiculeTypes.push('Remorque');
        }
    });

    // Get tires for these vehicles
    const pneus = await Pneu.find({
        vehiculeId: { $in: vehiculeIds }
    }).populate('vehiculeId');

    res.status(200).json(pneus);
};

export const updatePneuStatus = async (req, res) => {
    const { id } = req.params;
    const { usure, etat, pression } = req.body;
    const chauffeurId = req.user.userId;

    // Check if the tire belongs to one of the chauffeur's vehicles
    const pneu = await Pneu.findById(id).populate('vehiculeId');
    if (!pneu) {
        throw new HttpError("Pneu not found", 404);
    }

    // Verify the chauffeur has access to this tire
    const hasAccess = await Trajet.findOne({
        chauffeur: chauffeurId,
        statut: { $in: ["Planifie", "En cours"] },
        $or: [
            { camion: pneu.vehiculeId },
            { remorque: pneu.vehiculeId }
        ]
    });

    if (!hasAccess) {
        throw new HttpError("You don't have access to this tire", 403);
    }

    // Update tire information
    const updateData = {};
    if (usure !== undefined) updateData.usure = usure;
    if (etat !== undefined) updateData.etat = etat;
    if (pression !== undefined) updateData.pression = pression;

    const updatedPneu = await Pneu.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "Pneu updated successfully", pneu: updatedPneu });
};

export const generateTrajetPDF = async (req, res) => {
    const { id } = req.params;
    const chauffeurId = req.user.userId;
    
    const trajet = await Trajet.findOne({ _id: id, chauffeur: chauffeurId })
        .populate('chauffeur', 'username email')
        .populate({
            path: 'camion',
            select: 'marque immatriculation kilometrage',
            populate: {
                path: 'remorqueAttachee',
                select: 'marque numeroSerie capaciteCharge'
            }
        })
        .populate('remorque', 'marque numeroSerie capaciteCharge');

    if (!trajet) {
        throw new HttpError("Trajet not found or not assigned to you", 404);
    }

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=trajet-${trajet._id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // PDF Header
    doc.fontSize(20).text('RAPPORT DE TRAJET', { align: 'center' });
    doc.moveDown();

    // Trip Information
    doc.fontSize(16).text('INFORMATIONS DU TRAJET', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12);
    doc.text(`Nom du trajet: ${trajet.nom}`);
    doc.text(`Point de départ: ${trajet.pointDepart}`);
    doc.text(`Point d'arrivée: ${trajet.pointArrivee}`);
    doc.text(`Distance: ${trajet.distance} km`);
    doc.text(`Durée estimée: ${trajet.dureeEstimee} heures`);
    doc.text(`Statut: ${trajet.statut}`);
    doc.text(`Date de départ: ${new Date(trajet.dateDepart).toLocaleDateString('fr-FR')}`);
    
    if (trajet.dateArrivee) {
        doc.text(`Date d'arrivée: ${new Date(trajet.dateArrivee).toLocaleDateString('fr-FR')}`);
    }
    
    doc.moveDown();

    // Driver Information
    doc.fontSize(16).text('INFORMATIONS DU CHAUFFEUR', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12);
    doc.text(`Nom: ${trajet.chauffeur.username}`);
    doc.text(`Email: ${trajet.chauffeur.email}`);
    doc.moveDown();

    // Vehicle Information
    doc.fontSize(16).text('INFORMATIONS DU VÉHICULE', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12);
    doc.text(`Camion: ${trajet.camion.marque}`);
    doc.text(`Immatriculation: ${trajet.camion.immatriculation}`);
    doc.text(`Kilométrage: ${trajet.camion.kilometrage} km`);
    
    if (trajet.camion.remorqueAttachee) {
        doc.text(`Remorque: ${trajet.camion.remorqueAttachee.marque}`);
        doc.text(`Numéro de série: ${trajet.camion.remorqueAttachee.numeroSerie}`);
        doc.text(`Capacité de charge: ${trajet.camion.remorqueAttachee.capaciteCharge} kg`);
    }
    
    doc.moveDown();

    // Mileage Information
    if (trajet.kilometrageDepart || trajet.kilometrageArrivee) {
        doc.fontSize(16).text('KILOMÉTRAGE', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(12);
        if (trajet.kilometrageDepart) {
            doc.text(`Kilométrage de départ: ${trajet.kilometrageDepart} km`);
        }
        if (trajet.kilometrageArrivee) {
            doc.text(`Kilométrage d'arrivée: ${trajet.kilometrageArrivee} km`);
            if (trajet.kilometrageDepart) {
                const kmParcourus = trajet.kilometrageArrivee - trajet.kilometrageDepart;
                doc.text(`Kilomètres parcourus: ${kmParcourus} km`);
            }
        }
        doc.moveDown();
    }

    // Notes
    if (trajet.notes) {
        doc.fontSize(16).text('NOTES', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(trajet.notes);
        doc.moveDown();
    }

    // Footer
    doc.fontSize(10).text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });

    // Finalize PDF
    doc.end();
};