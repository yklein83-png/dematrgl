/**
 * Service API pour l'entite Entreprise
 * Gestion de la configuration du cabinet
 */

import api from './api';
import { Entreprise, EntrepriseFormData } from '../types/entreprise';

/**
 * Recupere les informations de l'entreprise
 */
export const getEntreprise = async (): Promise<Entreprise | null> => {
  const response = await api.get<Entreprise | null>('/entreprise');
  return response.data;
};

/**
 * Met a jour ou cree les informations de l'entreprise
 */
export const updateEntreprise = async (data: EntrepriseFormData): Promise<Entreprise> => {
  const response = await api.put<Entreprise>('/entreprise', data);
  return response.data;
};

/**
 * Cree une nouvelle entreprise (premiere configuration)
 */
export const createEntreprise = async (data: EntrepriseFormData): Promise<Entreprise> => {
  const response = await api.post<Entreprise>('/entreprise', data);
  return response.data;
};
