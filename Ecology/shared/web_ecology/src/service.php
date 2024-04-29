<?php

if (isset($_GET['destination'])) {
    $destination = $_GET['destination'];
    
    $options = array(
        'http' => array(
            'method' => 'POST',
            'header' => 'Content-Type: text/plain',
            'content' => 'SCC{f4k3_fl4g_f0r_t3st1ng}'
        )
    );
    
    // HTTPS doesn't work in some environments
    $context = stream_context_create($options);
    
    $response = file_get_contents($destination, false, $context);
    
    echo 'Flag sent.';
} else {
    echo 'No destination provided.';
}
 
?>