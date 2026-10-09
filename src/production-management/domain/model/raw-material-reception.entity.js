import {Weight} from "../../../shared/domain/model/weight.js";
import {RawMaterialReceptionId} from "./raw-material-reception-id.js";
import {ReceptionDateTime} from "./reception-date-time.js";
import {Supplier} from "./supplier.js";
import {MaterialOrigin} from "./material-origin.js";

/**
 * Aggregate Root for the paddy rice a supplier delivers to the mill (US-05).
 */
export class RawMaterialReception {
    #id;
    #receivedAt;
    #supplier;
    #origin;
    #quantity;

    /**
     * @param {{id?: RawMaterialReceptionId|null, receivedAt: ReceptionDateTime, supplier: Supplier,
     *          origin: MaterialOrigin, quantity: Weight}} props
     *        id is null until the API registers the reception.
     */
    constructor({id = null, receivedAt, supplier, origin, quantity}) {
        if (id !== null && !(id instanceof RawMaterialReceptionId)) throw new Error('Invalid raw material reception id.');
        if (!(receivedAt instanceof ReceptionDateTime)) throw new Error('A reception requires its reception date and time.');
        if (!(supplier instanceof Supplier)) throw new Error('A reception requires its supplier.');
        if (!(origin instanceof MaterialOrigin)) throw new Error('A reception requires its origin.');
        if (!(quantity instanceof Weight) || !quantity.isPositive()) throw new Error('Received quantity must be greater than zero.');
        this.#id = id;
        this.#receivedAt = receivedAt;
        this.#supplier = supplier;
        this.#origin = origin;
        this.#quantity = quantity;
    }

    /**
     * Records a new reception. Unlike a reception rebuilt from the API, a new one cannot be dated in the future.
     * @param {{receivedAt: ReceptionDateTime, supplier: Supplier, origin: MaterialOrigin, quantity: Weight}} props
     * @returns {RawMaterialReception}
     */
    static record({receivedAt, supplier, origin, quantity}) {
        if (!(receivedAt instanceof ReceptionDateTime) || !receivedAt.isNotInFuture()) {
            throw new Error('A raw material reception cannot be recorded in the future.');
        }
        return new RawMaterialReception({id: null, receivedAt, supplier, origin, quantity});
    }

    get id() {
        return this.#id;
    }

    get receivedAt() {
        return this.#receivedAt;
    }

    get supplier() {
        return this.#supplier;
    }

    get origin() {
        return this.#origin;
    }

    get quantity() {
        return this.#quantity;
    }
}
