package com.grandinetti.spring.fede_proyecto_cine.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.grandinetti.spring.fede_proyecto_cine.domain.Booking;
import com.grandinetti.spring.fede_proyecto_cine.domain.Seat;
import com.grandinetti.spring.fede_proyecto_cine.domain.Showtime;
import com.grandinetti.spring.fede_proyecto_cine.domain.User;
import com.grandinetti.spring.fede_proyecto_cine.dto.SeatAvailability;
import com.grandinetti.spring.fede_proyecto_cine.repository.BookingRepository;
import com.grandinetti.spring.fede_proyecto_cine.repository.SeatRepository;
import com.grandinetti.spring.fede_proyecto_cine.repository.ShowtimeRepository;
import com.grandinetti.spring.fede_proyecto_cine.repository.UserRepository;

// Primera capa "service" del proyecto: aparece justo aca porque crear una reserva
// no es un simple save() como en el resto de los controllers - hay que validar
// que user/showtime/seats existan de verdad y que las butacas no esten ya ocupadas.
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    public BookingService(
        BookingRepository bookingRepository,
        UserRepository userRepository,
        ShowtimeRepository showtimeRepository,
        SeatRepository seatRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
    }

    public Booking create(Booking request) {
        if (request.getUser() == null || request.getShowtime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan datos de usuario o funcion");
        }
        if (request.getSeats() == null || request.getSeats().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La reserva necesita al menos una butaca");
        }

        // Se buscan las entidades reales en vez de confiar en el objeto que mando el cliente
        // (que solo trae el id) - esto tambien valida que existan, con un 404 prolijo en vez
        // de un error de constraint de la base si el id no existe.
        User user = userRepository.findById(request.getUser().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Showtime showtime = showtimeRepository.findById(request.getShowtime().getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcion no encontrada"));

        List<Long> seatIds = request.getSeats().stream().map(Seat::getId).toList();
        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alguna butaca no existe");
        }

        List<Long> alreadyBooked = bookingRepository.findBookedSeatIds(showtime.getId(), seatIds);
        if (!alreadyBooked.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Las butacas " + alreadyBooked + " ya estan reservadas para esta funcion");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setSeats(seats);
        booking.setBookedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public List<SeatAvailability> getSeatAvailability(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcion no encontrada"));

        List<Seat> seats = showtime.getRoom().getSeats().stream()
            .sorted(Comparator.comparing(Seat::getSeatRow).thenComparing(Seat::getNumber))
            .toList();
        List<Long> seatIds = seats.stream().map(Seat::getId).toList();
        List<Long> occupiedIds = bookingRepository.findBookedSeatIds(showtimeId, seatIds);

        return seats.stream()
            .map(seat -> new SeatAvailability(
                seat.getId(),
                seat.getSeatRow(),
                seat.getNumber(),
                occupiedIds.contains(seat.getId())
            ))
            .toList();
    }
}
