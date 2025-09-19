import { getRepository } from "fireorm";
import { Reservations } from "../models/reservations";
import { CreateReservationDto } from "../Dto/reservationsDto";
import { Request, Response } from "express";
import { ReservationsTable } from "../models/reservations_Tables";

export class ReservationController {
  private repoReservation = getRepository(Reservations);

  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const { user_Id, date, start_Time, end_Time, tableIds } = req.body;

      if (!tableIds?.length) {
        res.status(400).json({ error: "Debe seleccionar al menos una mesa" });
        return;
      }

      const createdReservation = await this.repoReservation.create({
        user_Id,
        date: new Date(date),
        start_Time: new Date(start_Time),
        end_Time: new Date(end_Time),
        status: "pendiente",
        created_at: new Date(),
      });
      const reservationsTableRepo = getRepository(ReservationsTable);

      for (const tableId of tableIds) {
        const existing = await reservationsTableRepo
          .whereEqualTo("tableId", tableId)
          .find();

        const conflict = await Promise.all(
          existing.map(async (rt) => {
            const linkedRes = await this.repoReservation.findById(
              rt.reservationId
            );
            if (!linkedRes || linkedRes.status === "cancelada") return false;

            const sameDay =
              new Date(linkedRes.date).toDateString() ===
              new Date(date).toDateString();
            if (!sameDay) return false;

            const startA = new Date(start_Time).getTime();
            const endA = new Date(end_Time).getTime();
            const startB = new Date(linkedRes.start_Time).getTime();
            const endB = new Date(linkedRes.end_Time).getTime();

            return startA < endB && startB < endA;
          })
        );

        if (conflict.includes(true)) {
          res.status(409).json({
            error: `La mesa ${tableId} ya está reservada en el horario seleccionado`,
          });
          return;
        }

        await reservationsTableRepo.create({
          reservationId: createdReservation.id,
          tableId,
        });
      }
      res.status(201).json({
        message: "Reservación creada exitosamente",
        data: createdReservation,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error creando la reservación", error: err });
    }
  }

  async getAllReservations(req: Request, res: Response): Promise<void> {
    try {
      const all = await this.repoReservation.find();

      if (!all.length) {
        res.status(404).json({ message: "No se encontraron reservaciones" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const data = all.slice(offset, offset + limit);

      res.status(200).json({
        page,
        limit,
        total: all.length,
        data,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error obteniendo las reservaciones", error: err });
    }
  }

  async getReservationByID(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resReservations = await this.repoReservation.findById(id);
      if (!resReservations) {
        res.status(404).json({ message: "No se encontró esa reservación" });
        return;
      }

      res.status(200).json({ resReservations });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error buscando esta reservación", error: err });
    }
  }
  async updateReservationByID(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dataToUpdate = req.body;
      const resReservations = await this.repoReservation.findById(id);

      if (!resReservations) {
        res.status(404).json({ message: "No se encontró esa reservación" });
        return;
      }

      if (!dataToUpdate) {
        res.status(401).json({ message: "..." });
        return;
      }

      const updated: Reservations = { ...resReservations, ...dataToUpdate, id };
      const saved = await this.repoReservation.update(updated);
      res.status(200).json({ message: "Reservación actualizada", data: saved });
    } catch (err) {
      res.status(500).json({ message: "Error al actualizar la reservación" });
    }
  }

  async deleteReservationByID(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resReservations = await this.repoReservation.findById(id);

      if (!resReservations) {
        res.status(404).json({ message: "No se encontró esa reservación" });
        return;
      }
      await this.repoReservation.delete(id);
      res.status(200).json({ message: "Reservación eliminada correctamente" });
    } catch (err) {
      res.status(500).json({ message: "Error al eliminar la reservación" });
    }
  }
}
