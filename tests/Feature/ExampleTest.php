<?php

test('returns a successful response', function () {
    $response = $this->get(route('home'));

    $response
        ->assertOk()
        ->assertSee('/Images/doren-white-logo.jpeg', false);
});
