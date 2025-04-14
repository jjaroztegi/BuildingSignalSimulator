package com.signalapp.utils;

import com.signalapp.models.*;
import com.signalapp.dao.*;
import java.sql.SQLException;

public class SignalCalculator {
    
    public static double calculateSignalLevel(
            double inputSignal,
            Cable cable,
            double cableLength,
            Derivador derivador,
            Distribuidor distribuidor,
            AmplificadorRuidoBase amplificador,
            boolean isLastFloor) {
        
        double signalLevel = inputSignal;
        
        // 1. Cable attenuation (dB = attenuation per 100m * length in meters / 100)
        if (cable != null && cableLength > 0) {
            // Assuming standard cable attenuation of 20dB/100m if not specified
            double attenuationPer100m = 20.0;
            double cableAttenuation = (attenuationPer100m * cableLength) / 100.0;
            signalLevel -= cableAttenuation;
        }
        
        // 2. Derivador (Splitter) losses
        if (derivador != null) {
            if (isLastFloor) {
                // Use insertion loss for the last floor
                signalLevel -= derivador.getAtenuacion_insercion();
            } else {
                // Use branch loss for intermediate floors
                signalLevel -= derivador.getAtenuacion_derivacion();
            }
        }
        
        // 3. Distribuidor (Distributor) losses
        if (distribuidor != null) {
            signalLevel -= distribuidor.getAtenuacion_distribucion();
        }
        
        // 4. Amplifier effect
        if (amplificador != null) {
            // Add gain
            signalLevel += amplificador.getGanancia();
            // Consider attenuation
            signalLevel -= amplificador.getAtenuacion();
            // Note: Noise figure is used for SNR calculations, not direct signal level
        }
        
        return signalLevel;
    }
    
    public static boolean isSignalValid(double signalLevel, String signalType) throws SQLException {
        MargenCalidadDAO margenCalidadDAO = new MargenCalidadDAO();
        for (MargenCalidad margen : margenCalidadDAO.findAll()) {
            if (margen.getTipo_senal().equals(signalType)) {
                return signalLevel >= margen.getNivel_minimo() && 
                       signalLevel <= margen.getNivel_maximo();
            }
        }
        throw new IllegalArgumentException("Invalid signal type: " + signalType);
    }
    
    public static double calculateSNR(double signalLevel, AmplificadorRuidoBase amplificador) {
        if (amplificador == null) {
            return signalLevel; // No amplifier, return original signal level
        }
        
        // Basic SNR calculation using noise figure
        // SNR = Signal Level - Noise Figure - Thermal Noise Floor
        double thermalNoiseFloor = -174.0; // Standard thermal noise floor in dBm/Hz
        return signalLevel - amplificador.getFigura_ruido() - thermalNoiseFloor;
    }
} 