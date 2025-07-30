import { getRepository } from "fireorm";
import { Reservations } from "../models/reservations";
import { CreateReservationDto } from "../Dto/reservationsDto";
import { Request, Response } from "express";


export class ReservationController {
    private repoReservation = getRepository(Reservations);

    async createReservation(req: Request, res: Response): Promise<void> {
        try {
            const reservationData = req.body as CreateReservationDto;
            if(!reservationData) {
                res.status(404).json({error: "Datos requeridos"});
                return;
            }

            await this.repoReservation.create(reservationData);
            res.status(200).json({message: "Reservacion creada exitosamente"})

        } catch (err) {
            res.status(500).json({message: "Error al intentar crear un reserva", error: err})
        }
    }
    async getAllReservations(req: Request, res: Response): Promise<void>{
        try {
            const resReservation = await this.repoReservation.find()
            if(!resReservation) {
                res.status(404).json({message: "No se encontraron las reservaciones"});
                return;
            }
            res.status(200).json({resReservation})
        } catch (err) {
            res.status(500).json({message: "Error obteniendo las reservaciones", error: err})   
        }
    }

    async getReservationByID(req: Request, res: Response): Promise<void> {
        try {
            const {id} = req.params;
            const resReservations = await this.repoReservation.findById(id);
            if(!resReservations) {
                res.status(404).json({message: "No se encontró esa reservación"});
                return;
            }
            
            res.status(200).json({resReservations})
        } catch (err) {
             res.status(500).json({message: "Error buscando esta reservación", error: err});
        }
    }
    async updateReservationByID(req: Request, res: Response): Promise<void>{
        try {
            const { id } = req.params;
            const dataToUpdate = req.body;
            const resReservations = await this.repoReservation.findById(id);

           if(!resReservations) {
                res.status(404).json({message: "No se encontró esa reservación"});
                return;
            }

            if(!dataToUpdate) {
                res.status(401).json({message: "..."});
                return;
            }

            const updatedReservations = await this.repoReservation.update(dataToUpdate)

            res.status(200).json({updatedReservations});
        } catch (err) {
            res.status(500).json({message: "Error al actualizar la reservación"});
        }
    }

     async deleteReservationByID(req: Request, res: Response): Promise<void>{
       try {
            const { id } = req.params;
            const resReservations = await this.repoReservation.findById(id);
            
           if(!resReservations) {
                res.status(404).json({message: "No se encontró esa reservación"});
                return;
            }

            const updatedReservations = await this.repoReservation.delete(id) 

            res.status(200).json({updatedReservations});

        
       } catch (err) {
         res.status(500).json({message: "Error al eliminar la reservación"});
       }
    }
    

}