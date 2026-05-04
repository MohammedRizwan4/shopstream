import { nextId } from '../shared/ids.js';
import { sendTrackingNotice } from '../notifications/email.js';

export interface Shipment {
  id: string;
  orderId: string;
  address: string;
  carrier: 'ups' | 'dhl' | 'royal-mail';
  trackingCode: string;
}

const shipments = new Map<string, Shipment>();

export function dispatch(orderId: string, address: string, email: string): Shipment {
  const shipment: Shipment = {
    id: nextId('shp'),
    orderId,
    address,
    carrier: pickCarrier(address),
    trackingCode: nextId('trk').toUpperCase(),
  };
  shipments.set(shipment.id, shipment);
  sendTrackingNotice(email, shipment.trackingCode, shipment.carrier);
  return shipment;
}

export function scheduleReplenishment(productId: string, quantity: number): void {
  // Inbound freight is modelled as a shipment with a warehouse destination.
  shipments.set(`replenish-${productId}`, {
    id: nextId('shp'),
    orderId: `replenish-${quantity}`,
    address: 'WAREHOUSE-1',
    carrier: 'dhl',
    trackingCode: nextId('trk').toUpperCase(),
  });
}

function pickCarrier(address: string): Shipment['carrier'] {
  if (/\b(uk|united kingdom|london)\b/i.test(address)) return 'royal-mail';
  return address.length % 2 === 0 ? 'ups' : 'dhl';
}
