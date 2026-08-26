<?php

namespace App;

enum InventoryMovementType: string
{
    case Received = 'received';
    case Sold = 'sold';
}
